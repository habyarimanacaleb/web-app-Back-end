const express = require('express');
const router = express.Router();
const appCtrl = require('../controllers/applicationController');

router.post('/apply', appCtrl.submitApplication);
router.get('/applications', appCtrl.getApplications);
router.get('/applications/:id', appCtrl.getApplicationById);
router.put('/applications/:id', appCtrl.updateApplication);
router.delete('/applications/:id', appCtrl.deleteApplication);
router.delete('/applications', appCtrl.deleteAllApplications);

module.exports = router;
