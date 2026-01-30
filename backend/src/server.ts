import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './config/database';
import authRoutes from './routes/auth';
import conversationRoutes from './routes/conversations';
import messageRoutes from './routes/messages';
import tagRoutes from './routes/tags';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Allow frontend origin
  credentials: true, // Allow cookies and authorization headers
}));
app.use(express.json());

// Database synchronization
sequelize.sync()
  .then(async () => {
    console.log('Database synchronized');
    
    try {
      const queryInterface = sequelize.getQueryInterface();
      const tables = await queryInterface.showAllTables();
      const backupTables = tables.filter(table => table.includes('_backup'));
      
      for (const table of backupTables) {
        await queryInterface.dropTable(table);
      }
      
      if (backupTables.length > 0) {
        console.log(`Cleaned up ${backupTables.length} backup table(s)`);
      }
    } catch (cleanupError) {
      console.warn('Warning: Could not clean up backup tables:', cleanupError);
    }
  })
  .catch((err: any) => {
    console.error('Error synchronizing database:', err);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/tags', tagRoutes);

// Error handler middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;