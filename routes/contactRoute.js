const express = require('express');
const router = express.Router();
const contactCtrl = require('../controllers/contactControllers');

router.post('/contact', contactCtrl.submitContact);
router.get('/contacts', contactCtrl.getAllContacts);

module.exports = router;
