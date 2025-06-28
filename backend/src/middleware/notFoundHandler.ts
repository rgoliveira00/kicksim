import { Request, Response, NextFunction } from 'express';

// 404 Not Found handler middleware
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const errorResponse = {
    success: false,
    data: null,
    errors: [{
      code: 'ENDPOINT_NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
      details: {
        method: req.method,
        path: req.originalUrl,
        availableEndpoints: [
          'GET /health',
          'GET /api/v1/docs',
          'POST /api/v1/auth/login',
          'POST /api/v1/auth/register',
          'GET /api/v1/products',
          'GET /api/v1/users/profile'
        ]
      }
    }],
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(404).json(errorResponse);
};

export default notFoundHandler;

