require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./src/routes/auth');
const newsRoutes = require('./src/routes/news');
const contactRoutes = require('./src/routes/contact');
const memberRoutes = require('./src/routes/member');
const freightRateRoutes = require('./src/routes/freightRates');
const adminMemberRoutes = require('./src/routes/adminMembers');
const adminPortRoutes = require('./src/routes/adminPorts');
const orderRoutes = require('./src/routes/orders');
const publicApiRoutes = require('./src/routes/publicApi');
const portRoutes = require('./src/routes/ports');
const routeRoutes = require('./src/routes/routes');
const carrierRoutes = require('./src/routes/carriers');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://indigenex.com', 'https://admin.indigenex.com']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});
app.use('/api/auth/login', authLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/member', memberRoutes);
app.use('/api/freight-rates', freightRateRoutes);  // 公开运价查询
app.use('/api/admin/freight-rates', freightRateRoutes);  // 后台管理
app.use('/api/admin/members', adminMemberRoutes);
app.use('/api/admin/ports', adminPortRoutes);
app.use('/api/admin/routes', routeRoutes);
app.use('/api/admin/carriers', carrierRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/v1', publicApiRoutes);
app.use('/api/ports', portRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
});

module.exports = app;
