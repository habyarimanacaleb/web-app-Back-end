const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');
const isAdmin = require('../middleware/IsAdmin');

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);
router.post('/logout', userCtrl.logout);
router.get('/dashboard/users', isAdmin, userCtrl.adminDashboard);

module.exports = router;
