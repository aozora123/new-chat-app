import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // 记录详细的错误信息
  logger.error('Error occurred', {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    errorName: err.name,
    errorCode: err.code,
    params: req.params,
    query: req.query,
    body: req.body ? JSON.stringify(req.body).substring(0, 500) : null
  });
  
  // 处理不同类型的错误
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      error: 'Authentication failed',
      message: 'Invalid or expired token',
      code: 'UNAUTHORIZED'
    });
  }
  
  if (err.name === 'SequelizeValidationError') {
    const validationErrors = err.errors.map((error: any) => ({
      field: error.path || error.field,
      message: error.message,
      value: error.value
    }));
    return res.status(400).json({ 
      error: 'Validation failed',
      message: 'Invalid input data',
      code: 'VALIDATION_ERROR',
      details: validationErrors
    });
  }
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ 
      error: 'Resource already exists',
      message: 'The resource you are trying to create already exists',
      code: 'CONFLICT'
    });
  }
  
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ 
      error: 'Foreign key constraint error',
      message: 'Invalid reference to another resource',
      code: 'FOREIGN_KEY_ERROR'
    });
  }
  
  if (err.name === 'SequelizeDatabaseError') {
    return res.status(400).json({ 
      error: 'Database error',
      message: 'Invalid data provided',
      code: 'DATABASE_ERROR'
    });
  }
  
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({ 
      error: 'Service unavailable',
      message: 'Cannot connect to database or external service',
      code: 'SERVICE_UNAVAILABLE'
    });
  }
  
  if (err.code === 'ENOENT') {
    return res.status(404).json({ 
      error: 'Resource not found',
      message: 'The requested resource does not exist',
      code: 'NOT_FOUND'
    });
  }
  
  // 处理404错误
  if (err.status === 404) {
    return res.status(404).json({ 
      error: 'Not found',
      message: 'The requested resource does not exist',
      code: 'NOT_FOUND'
    });
  }
  
  // 处理403错误
  if (err.status === 403) {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'You do not have permission to access this resource',
      code: 'FORBIDDEN'
    });
  }
  
  // 处理400错误
  if (err.status === 400) {
    return res.status(400).json({ 
      error: 'Bad request',
      message: err.message || 'Invalid request',
      code: 'BAD_REQUEST'
    });
  }
  
  // 处理500错误
  res.status(500).json({ 
    error: 'Internal server error',
    message: 'Something went wrong on the server',
    code: 'INTERNAL_ERROR'
  });
};