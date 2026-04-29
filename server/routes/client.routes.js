const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');
const auth = require('../middleware/auth');

router.use(auth); // All client routes require auth

router.get('/', clientController.getClients);
router.post('/', clientController.createClient);
router.get('/:id', clientController.getClientById);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

module.exports = router;
