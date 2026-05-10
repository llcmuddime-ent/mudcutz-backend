import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/index.js';

import authRoutes from './routes/authRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import productRoutes from './routes/productRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import userRoutes from './routes/userRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reportRoutes from './routes/reportsRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

console.log('🔄 Starting MudCutz Server...\n');

// ======================
// MIDDLEWARE
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');


// CORS
app.use((req, res, next) => {
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com', 'http://localhost:4173']
    : ['http://localhost:5173'];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));


// ======================
// ROUTES
// ======================
app.use(config.BASE_URL + '/auth', authRoutes);
app.use(config.BASE_URL + '/users', userRoutes);
app.use(config.BASE_URL + '/bookings', bookingRoutes);
app.use(config.BASE_URL + '/sales', paymentRoutes);
app.use(config.BASE_URL + '/products', productRoutes);
app.use(config.BASE_URL + '/services', serviceRoutes);
app.use(config.BASE_URL + '/reports', reportRoutes);

// ======================
// PRODUCTION: Serve React Frontend
// ======================
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
} else {
  // Development static files
  app.use(express.static(path.join(__dirname, 'public')));
}


// ======================
// ERROR HANDLING
// ======================
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
})

app.get('/', (req, res) => {
    res.redirect(config.BASE_URL);
    console.log(`Redirecting to API base URL ${config.BASE_URL}`);
});


// ======================
// DATABASE CONNECTION
// ======================
const DB_URI = process.env.NODE_ENV === 'production' 
  ? config.DB_URI_PROD 
  : config.DB_URI_DEV;

mongoose.set('strictQuery', true);

mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(config.PORT, config.DB_HOST, () => {
      console.log(`🚀 Server running on http://localhost:${config.PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.log('❌ MongoDB Connection Failed');
    console.log('────────────────────────────────────');

    if (err.message.includes('ECONNREFUSED')) {
      console.log('🔴 Error: Could not connect to MongoDB. Is MongoDB running?');
    } 
    else if (err.message.includes('whitelist') || err.message.includes('IP address')) {
      console.log('🔴 Error: Your IP address is not whitelisted in MongoDB Atlas.');
      console.log('Solution:');
      console.log('   1. Go to MongoDB Atlas → Network Access');
      console.log('   2. Click "Add IP Address"');
      console.log('   3. Add your current IP or use 0.0.0.0/0 (for development)');
      console.log('   4. Save changes and restart the server');
    } 
    else {
      console.log('🔴 Error Message:', err.message);
    }

    console.log('────────────────────────────────────');
    console.log('Server will NOT start until database connection is fixed.');
  });
