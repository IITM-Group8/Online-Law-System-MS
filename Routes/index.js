// Import external package
const express = require("express");
const router = express.Router();

// Import Internal Files
const UserController = require('../Controllers/UserController');
const AdminController = require('../Controllers/AdminController');
const LawyerController = require('../Controllers/LawyerController');

// Routes

router.post('/registerUser', UserController.registerUser);
router.post('/login', UserController.loginUser);
router.get('/usersByRole/:role', UserController.getUsersByRole);

router.post('/ipcLaw', AdminController.updateIPCLaw);
router.get('/ipcLaws', AdminController.getIPCLaws);



module.exports = router;