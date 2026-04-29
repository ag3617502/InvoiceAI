const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const auth = require('../middleware/auth');

router.use(auth); // All invoice routes require auth

router.get('/', invoiceController.getInvoices);
router.post('/', invoiceController.createInvoice);
router.get('/:id', invoiceController.getInvoiceById);
router.get('/:id/download', invoiceController.downloadInvoicePDF);
router.put('/:id', invoiceController.updateInvoice);
router.delete('/:id', invoiceController.deleteInvoice);
router.post('/:id/mark-paid', invoiceController.markPaid);
router.post('/:id/mark-sent', invoiceController.markSent);

module.exports = router;
