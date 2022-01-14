// Import external package
const express = require("express");
const router = express.Router();

// Import Internal Files
const UserController = require('../Controllers/UserController');
const AdminController = require('../Controllers/AdminController');
const LawyerController = require('../Controllers/LawyerController');

// Routes

router.post('/user/registerUser', UserController.registerUser);
router.post('/user/login', UserController.loginUser);
router.get('/user/usersByRole/:role', UserController.getUsersByRole);

router.post('/laws/ipcLaw', AdminController.updateIPCLaw);
router.get('/laws/ipcLaws', AdminController.getIPCLaws);

router.post('/court/courts', AdminController.udateCourtDetails);
router.get('/court/courts', AdminController.getListOfCourts);



module.exports = router;