import dotenv from 'dotenv';
dotenv.config();

dotenv.config({
  silent: true,
  path: '.env'
})

const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_URL: process.env.DB_URL,
  BASE_URL: process.env.BASE_URL || '/api/v1'
};

export default config;