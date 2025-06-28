import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@/models/User';
import { createAuthError, createForbiddenError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: number;
    }
  }
}

// JWT payload interface
interface JWTPayload {
  sub: number;
  email: string;
  role: string;
  permissions: string[];
  iat: number;
  exp: number;
}

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createAuthError('Authentication token required');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    // Find user
    const user = await User.findByPk(decoded.sub, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw createAuthError('User not found');
    }

    // Check if user is active
    if (!user.isActive) {
      throw createAuthError('Account is deactivated');
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;

    // Log authentication success
    logger.debug(`User authenticated: ${user.email} (ID: ${user.id})`);

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(createAuthError('Invalid authentication token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(createAuthError('Authentication token has expired'));
    } else {
      next(error);
    }
  }
};

// Optional authentication middleware (doesn't throw error if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      return next();
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    const user = await User.findByPk(decoded.sub, {
      attributes: { exclude: ['password'] }
    });

    if (user && user.isActive) {
      req.user = user;
      req.userId = user.id;
    }

    next();
  } catch (error) {
    // Ignore authentication errors in optional auth
    next();
  }
};

// Role-based authorization middleware
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(createAuthError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(createForbiddenError(`Access denied. Required roles: ${roles.join(', ')}`));
    }

    next();
  };
};

// Permission-based authorization middleware
export const requirePermission = (...permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(createAuthError('Authentication required'));
    }

    // Check if user has required permissions
    const userPermissions = getUserPermissions(req.user.role);
    const hasPermission = permissions.every(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return next(createForbiddenError(`Insufficient permissions. Required: ${permissions.join(', ')}`));
    }

    next();
  };
};

// Resource ownership middleware
export const requireOwnership = (resourceIdParam: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(createAuthError('Authentication required'));
    }

    const resourceId = parseInt(req.params[resourceIdParam]);
    const userId = req.user.id;

    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Check ownership (this will be customized per resource type)
    if (resourceId !== userId) {
      return next(createForbiddenError('Access denied. You can only access your own resources.'));
    }

    next();
  };
};

// Seller authorization middleware
export const requireSeller = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(createAuthError('Authentication required'));
  }

  if (req.user.role !== 'seller' && req.user.role !== 'admin') {
    return next(createForbiddenError('Seller access required'));
  }

  next();
};

// Admin authorization middleware
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(createAuthError('Authentication required'));
  }

  if (req.user.role !== 'admin') {
    return next(createForbiddenError('Admin access required'));
  }

  next();
};

// Get user permissions based on role
export const getUserPermissions = (role: string): string[] => {
  const permissions: Record<string, string[]> = {
    buyer: [
      'read:products',
      'read:own_profile',
      'write:own_profile',
      'write:orders',
      'read:own_orders',
      'write:reviews',
      'read:reviews',
      'write:messages',
      'read:own_messages'
    ],
    seller: [
      'read:products',
      'write:own_products',
      'read:own_products',
      'read:own_profile',
      'write:own_profile',
      'read:own_orders',
      'write:order_status',
      'write:reviews',
      'read:reviews',
      'write:messages',
      'read:own_messages',
      'read:analytics'
    ],
    admin: [
      'read:*',
      'write:*',
      'delete:*',
      'manage:users',
      'manage:products',
      'manage:orders',
      'manage:reviews',
      'manage:system',
      'read:analytics'
    ]
  };

  return permissions[role] || [];
};

// Rate limiting by user
export const userRateLimit = (maxRequests: number, windowMs: number) => {
  const requests = new Map<number, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next();
    }

    const userId = req.user.id;
    const now = Date.now();
    const userRequests = requests.get(userId);

    if (!userRequests || now > userRequests.resetTime) {
      // Reset or initialize counter
      requests.set(userId, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    if (userRequests.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        errors: [{
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.'
        }],
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    }

    userRequests.count++;
    next();
  };
};

export default authenticate;

