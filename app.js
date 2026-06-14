import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import path from 'path';
import cors from 'cors';
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



const allowedOrigins = [
  'http://localhost:4173',
  'http://localhost:5173',
  config.FRONTEND_URL // Remove trailing slash if present
];

const normalizeOrigin = (url) =>
  url?.replace(/\/$/, '').toLowerCase();

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const normalizedOrigin = normalizeOrigin(origin);

      const isAllowed = allowedOrigins.some(
        (allowed) =>
          normalizeOrigin(allowed) === normalizedOrigin
      );

      if (isAllowed) {
        return callback(null, true);
      }
      console.error('Blocked Origin:', origin);

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.options('*', cors());

// Logging
app.use((req, res, next) => {
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Origin:', req.headers.origin);
  console.log(req.method, req.originalUrl);
  next();
});

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
app.use((req, res, next) => {
  console.log('Origin:', req.headers.origin);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  next();
});


// ======================
// DATABASE CONNECTION
// ======================

mongoose.set('strictQuery', true);

if (!config.DB_URL) {
  console.error('❌ MongoDB connection string missing. Set DB_URL or DB_URI in .env.');
  process.exit(1);
}

mongoose.connect(config.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
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
