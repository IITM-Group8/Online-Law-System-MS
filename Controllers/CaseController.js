const CaseDetails = require('../Models/CaseDetails');
const Commonconstants = require('../Constants/Commonconstants');

const formidable = require('formidable');
const fs = require("fs");
// const date = require('date-and-time');

exports.fileACaseByPublic = (request, response) => {
    console.log("Filing a case begins");
    try {
        var caseDetails = new CaseDetails();
        var form = new formidable.IncomingForm({ multiples: true });
        //var form = formidable({ multiples: true });
        form.parse(request, function (err, fields, files) {
            console.log("fields : ", fields);
            console.log("files : ", files);
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
            console.log("details: ---- : ", fields.public_user_id, fields.lawyer_id, fields.ipc_section,
                fields.case_description);
            caseDetails.case_status = 'New';
            let caseFileList = [];
            if (files.case_files) {
                for (persistentFile of files.case_files) {
                    var file = fs.readFileSync(persistentFile.filepath);
                    var encodedFile = file.toString('base64');
                    var finalFile = {
                        contentType: persistentFile.mimetype,
                        file: Buffer.from(encodedFile, 'base64')
                    };
                    caseFileList.push(finalFile);
                }
                caseDetails.case_files = caseFileList;
            }
            const currentDate = new Date();
            caseDetails.created_time_stamp = currentDate;
            // caseDetails.created_date = date.format(currentDate,'YYYY/MM/DD');
            caseDetails.modified_date = currentDate;

            console.log("CaseDetails findone starting");
            CaseDetails.findOne({
                "_public_user_id": caseDetails._public_user_id,
                "_ipc_section_id": caseDetails._ipc_section_id,
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
                            console.log("Case filed successfully", result);
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
            response.status(200).json({
                status: Commonconstants.SUCCESS,
                message: 'Case details fetched successfully',
                laws: result,
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

        CaseDetails.findOne({
            "_id": caseID
        }, function (err, obj) {
            if (err) {
                response.status(500).json({
                    status: Commonconstants.FAILED,
                    message: "Failed in Validation",
                    statusCode: 500
                });
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
                        }
                        else {
                            console.log("Case status updated result: ", result);
                            if (result.modifiedCount <= 0) {
                                response.status(500).json({
                                    status: Commonconstants.FAILED,
                                    message: "Failed to Update Case status",
                                    statusCode: 500
                                });
                            } else {
                                response.status(201).json({
                                    status: Commonconstants.SUCCESS,
                                    message: "Case Status updated successfully",
                                    statusCode: 201
                                });
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
    }
}