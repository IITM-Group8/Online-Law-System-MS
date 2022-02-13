const CaseDetails = require('../Models/CaseDetails');
const Commonconstants = require('../Constants/Commonconstants');
var Binary = require('mongodb').Binary;

const formidable = require('formidable');
const fs = require("fs");

exports.fileACaseByPublic = (request, response) => {
    console.log("Filing a case begins");
    try {
        var caseDetails = new CaseDetails();
        var form = new formidable.IncomingForm({ multiples: true });
        form.keepExtensions = true;
        // var form = formidable({ multiples: true });
        form.parse(request, function (err, fields, files) {
            if (err) {
                console.error(err.message);
                response.status(500).json({
                    status: Commonconstants.FAILED,
                    message: "Failed in Validation",
                    statusCode: 500
                });
                return;
            }

            caseDetails._public_user_id = fields.public_user_id;
            caseDetails._lawyer_id = fields.lawyer_id;
            caseDetails.ipc_section = fields.ipc_section;
            caseDetails.case_description = fields.case_description;
            caseDetails.case_status = 'New';
            let caseFileList = [];
            if (files.case_files && files.case_files.length > 1) {
                for (persistentFile of files.case_files) {
                    var file = fs.readFileSync(persistentFile.filepath, 'base64');
                    var finalFile = {
                        contentType: persistentFile.mimetype,
                        file: file
                        // file: Binary(file)
                        // file: file
                    };
                    caseFileList.push(finalFile);
                }
            } else {
                var file = fs.readFileSync(files.case_files.filepath, 'base64');
                var finalFile = {
                    contentType: files.case_files.mimetype,
                    file: file
                };
                caseFileList.push(finalFile);
            }
            caseDetails.case_files = caseFileList;
            const currentDate = new Date();
            caseDetails.created_time_stamp = currentDate;
            // caseDetails.created_date = date.format(currentDate,'YYYY/MM/DD');
            caseDetails.modified_date = currentDate;

            console.log("CaseDetails findone starting");
            CaseDetails.findOne({
                "_public_user_id": caseDetails._public_user_id,
                "ipc_section": caseDetails.ipc_section,
            }, function (err, obj) {
                if (err) {
                    response.status(500).json({
                        status: Commonconstants.FAILED,
                        message: "Failed in Validation",
                        statusCode: 500
                    });
                    return;
                } else {
                    if (obj != null && !obj.case_status != 'Rejected') {
                        console.log("Current user has already filed a case on this section.");
                        response.status(200).json({
                            status: Commonconstants.SUCCESS,
                            message: "User has already filed a case on this section.",
                            statusCode: 200
                        });
                        return;
                    }
                    caseDetails.case_status = 'New';
                    console.log("Persisting a case details");
                    caseDetails.save(function (err, result) {
                        if (err) {
                            console.log("Error in Filing a case ", err);
                            response.status(500).json({
                                status: Commonconstants.FAILED,
                                message: "Failed to File a case",
                                statusCode: 500
                            });
                            return;
                        }
                        else {
                            console.log("Case filed successfully", result._id);
                            response.status(201).json({
                                status: Commonconstants.SUCCESS,
                                message: "Case filed successfully",
                                statusCode: 201
                            });
                            return;
                        }
                    });
                }
            });
        });
    } catch (error) {
        console.log("Failed to file a case", result);
        response.status(500).json({
            status: Commonconstants.FAILED,
            message: "Failed to file a case",
            statusCode: 500
        });
        return;
    }
}

exports.getCaseDetails = (request, response) => {
    const caseDetails = request.body;
    console.log('Fetch Case details begins ');
    try {
        const caseStatus = caseDetails.caseStatus;
        const publicUserId = caseDetails.publicUserId;
        const lawyerUserId = caseDetails.lawyerUserId;

        if (publicUserId && lawyerUserId) {
            response.status(200).json({
                status: Commonconstants.SUCCESS,
                message: 'Invalid Input. Either Public User or Lawyer can access individually.',
                statusCode: 500
            });
            return;
        }

        var input = {};
        if (publicUserId && caseStatus) {
            input = {
                _public_user_id: publicUserId,
                case_status: caseStatus
            }
        } else if (lawyerUserId && caseStatus) {
            input = {
                _lawyer_id: lawyerUserId,
                case_status: caseStatus
            }
        } else if (publicUserId && !caseStatus) {
            input = {
                _public_user_id: publicUserId
            }
        } else if (lawyerUserId && !caseStatus) {
            input = {
                _lawyer_id: lawyerUserId,
            }
        } else if (caseStatus) {
            input = {
                case_status: caseStatus
            }
        }
        console.log("Query to get case details: ", input);
        CaseDetails.find(input).then(result => {
            if (result.length <= 0) {
                response.status(200).json({
                    status: Commonconstants.SUCCESS,
                    message: 'No Records Found',
                    statusCode: 401
                });
                return;
            }
            const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            var caseDet = [];
            for (resultData of result) {
                const month = resultData.created_time_stamp.getUTCMonth();
                const createdDate = resultData.created_time_stamp.getUTCDate() + "-" + months[month] + "-" + resultData.created_time_stamp.getUTCFullYear();

                var fileContent = undefined;
                if (resultData.case_files != null && resultData.case_files) {
                    //TODO:
                    //Currently supporting only text file. Yet to do for the other types of files.
                    // var tempList = [];
                    // const caseFiles = resultData.case_files;
                    // for (let files of caseFiles) {
                    //     console.log("resultData content type: ", files.contentType);
                    //     tempList.push(file);
                    // }
                    fileContent = resultData.case_files;
                }
                const det = {
                    id: resultData["_id"],
                    caseFiles: fileContent,
                    ipcSection: resultData.ipc_section,
                    caseDescription: resultData.case_description,
                    caseStatus: resultData.case_status,
                    createdDate: createdDate
                }
                caseDet.push(det);
            }
            response.status(200).json({
                status: Commonconstants.SUCCESS,
                message: 'Case details fetched successfully',
                case: caseDet,
                statusCode: 200
            });
        }).catch(error => {
            console.log("Failed to fetch Case details ", error);
            response.status(500).json({
                status: Commonconstants.FAILED,
                message: 'Failed to fetch Case details',
                statusCode: 500
            });
        });
    } catch (error) {
        console.log("Failed to fetch Case details ", error);
        response.status(500).json({
            status: Commonconstants.FAILED,
            message: 'Failed to fetch Case details',
            statusCode: 500
        });
    }
}

exports.updateCase = (request, response) => {
    console.log("Update Case begins");
    try {
        const caseDetails = request.body;
        const caseID = caseDetails.caseId;
        const caseStatus = caseDetails.caseStatus;

        console.log("caseID : caseStatus : ", caseID, caseStatus);

        CaseDetails.findOne({
            "_id": caseID
        }, function (err, obj) {
            if (err) {
                response.status(500).json({
                    status: Commonconstants.FAILED,
                    message: "Failed in Validation",
                    statusCode: 500
                });
                return;
            } else {
                if (obj != null && obj) {
                    console.log("Updating case starts");
                    const currentDate = new Date();
                    CaseDetails.updateOne({
                        "_id": caseID
                    }, {
                        case_status: caseStatus,
                        modified_date: currentDate
                    }, function (err, result) {
                        if (err) {
                            console.log("Error in updating Case status", err);
                            response.status(200).json({
                                status: Commonconstants.FAILED,
                                message: "Failed to update Case status",
                                statusCode: 500
                            });
                            return;
                        }
                        else {
                            console.log("Case status updated result: ", result);
                            if (result.modifiedCount <= 0) {
                                response.status(500).json({
                                    status: Commonconstants.FAILED,
                                    message: "Failed to Update Case status",
                                    statusCode: 500
                                });
                                return;
                            } else {
                                response.status(201).json({
                                    status: Commonconstants.SUCCESS,
                                    message: "Case Status updated successfully",
                                    statusCode: 201
                                });
                                return;
                            }
                        }
                    });
                }
            }
        });
    } catch (error) {
        console.log("Error in updating Case status", error);
        response.status(200).json({
            status: Commonconstants.FAILED,
            message: "Failed to update Case status",
            statusCode: 500
        });
        return;
    }
}