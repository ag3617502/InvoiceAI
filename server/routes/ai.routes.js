const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const auth = require('../middleware/auth');
const requirePlan = require('../middleware/planGuard');

router.use(auth); // All AI routes require auth

router.post('/payment-reminder', requirePlan('starter'), aiController.generatePaymentReminder);
router.post('/proposal-writer', requirePlan('pro'), aiController.generateProposal);
router.post('/tax-estimator', requirePlan('pro'), aiController.generateTaxEstimator);
router.post('/business-insights', requirePlan('pro'), aiController.generateBusinessInsights);
router.post('/invoice-writer', requirePlan('starter'), aiController.generateInvoiceWriter);

module.exports = router;
