import { Sequelize } from 'sequelize';

const dbName = process.env.DB_NAME || 'chatapp_db';
const dbUser = process.env.DB_USER || 'admin';
const dbPassword = process.env.DB_PASSWORD || 'password';

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: process.env.DB_HOST || 'localhost',
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false, // Set to console.log to see SQL queries
});