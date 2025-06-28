import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Import configurations and middleware
import { connectDatabase } from '@/config/database';
import { connectRedis } from '@/config/redis';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';
import { requestLogger } from '@/middleware/requestLogger';

// Import routes
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/users';
import productRoutes from '@/routes/products';
import orderRoutes from '@/routes/orders';
import cartRoutes from '@/routes/cart';
import paymentRoutes from '@/routes/payments';
import reviewRoutes from '@/routes/reviews';
import messageRoutes from '@/routes/messages';
import searchRoutes from '@/routes/search';
import adminRoutes from '@/routes/admin';

// Load environment variables
dotenv.config();

class App {
  public app: express.Application;
  public server: any;
  public io: Server;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: process.env.SOCKET_IO_CORS_ORIGIN?.split(',') || ['http://localhost:19006'],
        methods: ['GET', 'POST']
      }
    });

    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeSocketIO();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:19006'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Version', 'X-Platform']
    }));

    // Compression middleware
    this.app.use(compression());

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      message: {
        success: false,
        errors: [{
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests from this IP, please try again later.'
        }]
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use('/api/', limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use(requestLogger);

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: process.env.npm_package_version || '1.0.0',
          environment: process.env.NODE_ENV || 'development'
        }
      });
    });
  }

  private initializeRoutes(): void {
    const apiVersion = process.env.API_VERSION || 'v1';
    const baseRoute = `/api/${apiVersion}`;

    // API routes
    this.app.use(`${baseRoute}/auth`, authRoutes);
    this.app.use(`${baseRoute}/users`, userRoutes);
    this.app.use(`${baseRoute}/products`, productRoutes);
    this.app.use(`${baseRoute}/orders`, orderRoutes);
    this.app.use(`${baseRoute}/cart`, cartRoutes);
    this.app.use(`${baseRoute}/payments`, paymentRoutes);
    this.app.use(`${baseRoute}/reviews`, reviewRoutes);
    this.app.use(`${baseRoute}/messages`, messageRoutes);
    this.app.use(`${baseRoute}/search`, searchRoutes);
    this.app.use(`${baseRoute}/admin`, adminRoutes);

    // API documentation endpoint
    this.app.get(`${baseRoute}/docs`, (req, res) => {
      res.json({
        success: true,
        data: {
          title: 'Marketplace API Documentation',
          version: apiVersion,
          endpoints: {
            auth: `${baseRoute}/auth`,
            users: `${baseRoute}/users`,
            products: `${baseRoute}/products`,
            orders: `${baseRoute}/orders`,
            cart: `${baseRoute}/cart`,
            payments: `${baseRoute}/payments`,
            reviews: `${baseRoute}/reviews`,
            messages: `${baseRoute}/messages`,
            search: `${baseRoute}/search`,
            admin: `${baseRoute}/admin`
          }
        }
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  private initializeSocketIO(): void {
    this.io.on('connection', (socket) => {
      logger.info(`Socket connected: ${socket.id}`);

      socket.on('authenticate', (data) => {
        // Handle socket authentication
        // This will be implemented with JWT verification
        logger.info(`Socket authentication attempt: ${socket.id}`);
      });

      socket.on('join_room', (roomId) => {
        socket.join(roomId);
        logger.info(`Socket ${socket.id} joined room: ${roomId}`);
      });

      socket.on('leave_room', (roomId) => {
        socket.leave(roomId);
        logger.info(`Socket ${socket.id} left room: ${roomId}`);
      });

      socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id}`);
      });
    });
  }

  public async initialize(): Promise<void> {
    try {
      // Connect to database
      await connectDatabase();
      logger.info('Database connected successfully');

      // Connect to Redis
      await connectRedis();
      logger.info('Redis connected successfully');

      logger.info('Application initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize application:', error);
      process.exit(1);
    }
  }

  public listen(): void {
    const port = process.env.PORT || 3000;
    
    this.server.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`API Version: ${process.env.API_VERSION || 'v1'}`);
    });
  }
}

// Create and start the application
const app = new App();

// Initialize the application
app.initialize().then(() => {
  app.listen();
}).catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  app.server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  app.server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

export default app;

