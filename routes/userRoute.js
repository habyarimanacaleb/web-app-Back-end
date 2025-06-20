const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);
router.post('/logout', userCtrl.logout);
router.get('/dashboard', userCtrl.adminDashboard);
router.get('/users', userCtrl.getAllUsers);
router.get('/users/:id', userCtrl.getUserById);
router.put('/users/:id', userCtrl.updateUser);
router.delete('/users/:id', userCtrl.deleteUser);

module.exports = router;
