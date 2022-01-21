const CaseDetails = require('../Models/CaseDetails');
const Commonconstants = require('../Constants/Commonconstants');

const formidable = require('formidable');
const fs = require("fs");
// const date = require('date-and-time');

exports.fileACaseByPublic = (request, response) => {
    console.log("Filing a case begins");
    var caseDetails = new CaseDetails();
    // var form = new formidable.IncomingForm();
    var form = formidable({ multiples: true });
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
        caseDetails._ipc_section_id = fields.ipc_section_id;
        caseDetails.case_description = fields.case_description;
        caseDetails.case_status = 'New';
        let caseFileList = [];
        for (persistentFile of files.case_files) {
            // console.log("persistentFile : ", persistentFile);
            var file = fs.readFileSync(persistentFile.filepath);
            var encodedFile = file.toString('base64');
            var finalFile = {
                contentType: persistentFile.mimetype,
                file: Buffer.from(encodedFile, 'base64')
            };
            caseFileList.push(finalFile);
        }
        caseDetails.case_files = caseFileList;
        const currentDate = new Date();
        caseDetails.created_time_stamp = currentDate;
        // caseDetails.created_date = date.format(currentDate,'YYYY/MM/DD');
        caseDetails.modified_date = currentDate;       

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
                    }
                    else {
                        console.log("Case file successfully", result);
                        response.status(201).json({
                            status: Commonconstants.SUCCESS,
                            message: "Case file successfully",
                            statusCode: 201
                        });
                    }                   
                });
            }
        });
    });   
}

// Work in progress
exports.getCaseDetails = (request, response) => {
    const caseStatus = request.params.case_status;
    console.log("Fetch Case details begins for case status: ", caseStatus);
    CaseDetails.find({
        case_status: caseStatus
    }).then(result => {
        if (result.length <= 0) {
            response.status(200).json({
                status: Commonconstants.SUCCESS,
                message: 'No Records Found',
                statusCode: 200
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
        console.log("Failed to fetch the Case details. ", error);
        response.status(500).json({
            status: Commonconstants.FAILED,
            message: 'Failed to fetch the Case details',
            statusCode: 500
        });
    });
}

