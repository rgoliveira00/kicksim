import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'sequelize';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { logger } from '@/utils/logger';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error response interface
interface ErrorResponse {
  success: false;
  data: null;
  errors: Array<{
    code: string;
    message: string;
    field?: string;
  }>;
  meta: {
    timestamp: string;
  };
}

// Global error handler middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let message = 'Internal server error';
  let field: string | undefined;

  // Log the error
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Handle different types of errors
  if (error instanceof AppError) {
    // Custom application errors
    statusCode = error.statusCode;
    errorCode = error.code;
    message = error.message;
  } else if (error instanceof ValidationError) {
    // Sequelize validation errors
    statusCode = 422;
    errorCode = 'VALIDATION_ERROR';
    message = 'Validation failed';
    
    // Handle multiple validation errors
    const validationErrors = error.errors.map(err => ({
      code: 'VALIDATION_ERROR',
      message: err.message,
      field: err.path
    }));

    const errorResponse: ErrorResponse = {
      success: false,
      data: null,
      errors: validationErrors,
      meta: {
        timestamp: new Date().toISOString()
      }
    };

    res.status(statusCode).json(errorResponse);
    return;
  } else if (error instanceof JsonWebTokenError) {
    // JWT errors
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  } else if (error instanceof TokenExpiredError) {
    // JWT expiration errors
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
  } else if (error.name === 'SequelizeUniqueConstraintError') {
    // Unique constraint violations
    statusCode = 409;
    errorCode = 'DUPLICATE_ENTRY';
    message = 'Resource already exists';
  } else if (error.name === 'SequelizeForeignKeyConstraintError') {
    // Foreign key constraint violations
    statusCode = 400;
    errorCode = 'INVALID_REFERENCE';
    message = 'Invalid reference to related resource';
  } else if (error.name === 'SequelizeConnectionError') {
    // Database connection errors
    statusCode = 503;
    errorCode = 'DATABASE_ERROR';
    message = 'Database connection failed';
  } else if (error.name === 'MulterError') {
    // File upload errors
    statusCode = 400;
    errorCode = 'FILE_UPLOAD_ERROR';
    
    if (error.message.includes('File too large')) {
      message = 'File size exceeds the maximum limit';
    } else if (error.message.includes('Unexpected field')) {
      message = 'Invalid file field';
    } else {
      message = 'File upload failed';
    }
  } else if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
    // JSON parsing errors
    statusCode = 400;
    errorCode = 'INVALID_JSON';
    message = 'Invalid JSON format in request body';
  }

  // Create error response
  const errorResponse: ErrorResponse = {
    success: false,
    data: null,
    errors: [{
      code: errorCode,
      message,
      ...(field && { field })
    }],
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  // Send error response
  res.status(statusCode).json(errorResponse);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation error helper
export const createValidationError = (message: string, field?: string): AppError => {
  const error = new AppError(message, 422, 'VALIDATION_ERROR');
  if (field) {
    (error as any).field = field;
  }
  return error;
};

// Authentication error helpers
export const createAuthError = (message: string = 'Authentication required'): AppError => {
  return new AppError(message, 401, 'AUTHENTICATION_REQUIRED');
};

export const createForbiddenError = (message: string = 'Access forbidden'): AppError => {
  return new AppError(message, 403, 'ACCESS_FORBIDDEN');
};

// Not found error helper
export const createNotFoundError = (resource: string = 'Resource'): AppError => {
  return new AppError(`${resource} not found`, 404, 'NOT_FOUND');
};

// Conflict error helper
export const createConflictError = (message: string): AppError => {
  return new AppError(message, 409, 'CONFLICT');
};

// Bad request error helper
export const createBadRequestError = (message: string): AppError => {
  return new AppError(message, 400, 'BAD_REQUEST');
};

// Service unavailable error helper
export const createServiceUnavailableError = (message: string = 'Service temporarily unavailable'): AppError => {
  return new AppError(message, 503, 'SERVICE_UNAVAILABLE');
};

export default errorHandler;

