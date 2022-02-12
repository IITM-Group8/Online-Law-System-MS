// Import external package
const express = require("express");
const router = express.Router();

// Import Internal Files
const UserController = require('../Controllers/UserController');
const AdminController = require('../Controllers/AdminController');
const CaseController = require('../Controllers/CaseController');
const ReportController = require('../Controllers/ReportController');

// Routes
router.post('/user/registerUser', UserController.registerUser);
router.post('/user/login', UserController.loginUser);
router.get('/user/usersByRole/:role/:user_status', UserController.getUsersByRole);
router.put('/user/userStatus', UserController.updateUserStatus);
router.post('/user/lawyers', UserController.getLawyer);
router.post('/user/password', UserController.generatePassword);

router.post('/laws/ipcLaw', AdminController.updateIPCLaw);
router.post('/laws/ipcLaws', AdminController.getIPCLaws);

router.post('/court/courts', AdminController.udateCourtDetails);
router.post('/court/fetch/courts', AdminController.getListOfCourts);

router.post('/case/public/fileACase', CaseController.fileACaseByPublic);
router.post('/case/caseDetails', CaseController.getCaseDetails);
router.put('/case/caseStatus', CaseController.updateCase);

router.post('/report/generateReport', ReportController.generateReport);

module.exports = router;