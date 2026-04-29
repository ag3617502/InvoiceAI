const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { globalLimiter } = require('./middleware/rateLimit');
const { errorResponse } = require('./utils/apiResponse');
const logger = require('./utils/logger');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Request logger middleware
app.use((req, res, next) => {
  logger.info(`[REQUEST] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Set security headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5174',
    credentials: true,
  })
);

// Rate limiting
// app.use('/api', globalLimiter);

// Mount routers
const authRoutes = require('./routes/auth.routes');
const clientRoutes = require('./routes/client.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const expenseRoutes = require('./routes/expense.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
// const paymentRoutes = require('./routes/payment.routes');
// const proposalRoutes = require('./routes/proposal.routes');
const aiRoutes = require('./routes/ai.routes');
const projectRoutes = require('./routes/project.routes');

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/projects', projectRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/proposals', proposalRoutes);
app.use('/api/ai', aiRoutes);
// app.use('/api/reports', reportRoutes);
// app.use('/api/gst', gstRoutes);
// app.use('/api/team', teamRoutes);
// app.use('/api/settings', settingsRoutes);

// 404 handler
app.use((req, res, next) => {
  return errorResponse(res, 'NOT_FOUND', 'Route not found', 404);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  return errorResponse(res, 'SERVER_ERROR', err.message || 'Internal Server Error', 500);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = app;
