import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // Log request details
  const requestInfo = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
    timestamp: new Date().toISOString()
  };

  // Log the incoming request
  logger.http(`Incoming ${req.method} ${req.originalUrl}`, requestInfo);

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const responseTime = Date.now() - startTime;
    
    // Log response details
    const responseInfo = {
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: res.get('Content-Length'),
      method: req.method,
      url: req.originalUrl,
      ip: req.ip
    };

    // Determine log level based on status code
    if (res.statusCode >= 500) {
      logger.error(`Response ${req.method} ${req.originalUrl} ${res.statusCode}`, responseInfo);
    } else if (res.statusCode >= 400) {
      logger.warn(`Response ${req.method} ${req.originalUrl} ${res.statusCode}`, responseInfo);
    } else {
      logger.http(`Response ${req.method} ${req.originalUrl} ${res.statusCode}`, responseInfo);
    }

    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

export default requestLogger;

