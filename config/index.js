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
  DB_URI_PROD: process.env.DB_URI_PROD,
  DB_URI_DEV: process.env.DB_URI_DEV,
  BASE_URL: process.env.BASE_URL || '/api/v1'
};

export default config;