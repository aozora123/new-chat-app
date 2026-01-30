import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid token.' });
  }
  
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ error: 'Resource already exists.' });
  }
  
  res.status(500).json({ error: 'Something went wrong!' });
};