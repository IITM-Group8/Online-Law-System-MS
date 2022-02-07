// Import external package
const express = require("express");
const router = express.Router();

// Import Internal Files
const UserController = require('../Controllers/UserController');
const AdminController = require('../Controllers/AdminController');
// const LawyerController = require('../Controllers/LawyerController');
const CaseController = require('../Controllers/CaseController');

// Routes

router.post('/user/registerUser', UserController.registerUser);
router.post('/user/login', UserController.loginUser);
router.get('/user/usersByRole/:role/:user_status', UserController.getUsersByRole);
router.put('/user/userStatus', UserController.updateUserStatus);

router.post('/laws/ipcLaw', AdminController.updateIPCLaw);
router.post('/laws/ipcLaws', AdminController.getIPCLaws);

router.post('/court/courts', AdminController.udateCourtDetails);
router.get('/court/courts/:area', AdminController.getListOfCourts);

router.post('/case/public/fileACase', CaseController.fileACaseByPublic);
router.post('/case/caseDetails', CaseController.getCaseDetails);
router.put('/case/caseStatus', CaseController.updateCase);

router.post('/user/lawyers', UserController.getLawyer);

module.exports = router;