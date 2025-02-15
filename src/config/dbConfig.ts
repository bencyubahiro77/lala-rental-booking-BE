import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER as any,
  password: process.env.DB_PASSWORD as any,
  database: process.env.DB_NAME as any,
  dialect: 'postgres',
  logging: false,
};

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,

  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'postgres',
    logging: dbConfig.logging,
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to PostgreSQL has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

export default sequelize;