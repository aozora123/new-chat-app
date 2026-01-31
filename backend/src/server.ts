import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import { sequelize } from './config/database';
import logger from './config/logger';
import authRoutes from './routes/auth';
import conversationRoutes from './routes/conversations';
import messageRoutes from './routes/messages';
import tagRoutes from './routes/tags';
import { errorHandler } from './middleware/errorHandler';

// Import database models to ensure they are registered with Sequelize
import './models';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'], // Allow frontend origin
  credentials: true, // Allow cookies and authorization headers
}));

// 请求体大小限制（10MB）
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 内容类型验证中间件
app.use((req: Request, res: Response, next: NextFunction) => {
  const method = req.method;
  const contentType = req.get('Content-Type');
  
  // 对于需要请求体的方法，验证内容类型
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    // 如果有请求体，验证内容类型
    if (req.body && contentType && !contentType.includes('application/json')) {
      logger.warn('Invalid Content-Type', { 
        expected: 'application/json', 
        received: contentType, 
        path: req.originalUrl 
      });
      return res.status(415).json({ 
        error: 'Unsupported Media Type',
        message: 'Content-Type must be application/json',
        code: 'UNSUPPORTED_MEDIA_TYPE'
      });
    }
  }
  next();
});

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info('Incoming request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Database synchronization
sequelize.sync()
  .then(async () => {
    logger.info('Database synchronized');
    
    try {
      const queryInterface = sequelize.getQueryInterface();
      const tables = await queryInterface.showAllTables();
      const backupTables = tables.filter(table => table.includes('_backup'));
      
      for (const table of backupTables) {
        await queryInterface.dropTable(table);
      }
      
      if (backupTables.length > 0) {
        logger.info(`Cleaned up ${backupTables.length} backup table(s)`);
      }
    } catch (cleanupError) {
      logger.warn('Warning: Could not clean up backup tables:', { error: cleanupError });
    }
  })
  .catch((err: any) => {
    logger.error('Error synchronizing database:', { error: err });
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/tags', tagRoutes);

// Error handler middleware
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;