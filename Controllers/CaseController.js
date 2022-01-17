const CaseDetails = require('../Models/CaseDetails');
const formidable = require('formidable');

exports.fileACaseByPublic = (request, response) => {
    console.log("Filing a case begins");
    var caseDetails = new CaseDetails();
    // var form = new formidable.IncomingForm();
    var form = formidable({multiples: true});
    form.parse(request, function (err, fields, files) {
        if (err) {
            console.error(err.message);
            response.status(500).json({
                status: "failed",
                message: "Failed in Validation",
                statusCode: 500
            });
            return;
        }
        console.log("fields._public_user_id ", fields._public_user_id);
        console.log("files ", files);
        caseDetails._public_user_id = fields._public_user_id;
        caseDetails._lawyer_id = fields._lawyer_id;
        caseDetails._ipc_section_id = fields._ipc_section_id;
        caseDetails.case_description = fields.case_description;
        caseDetails.case_status = 'New';
        caseDetails.case_files = files;
        let publicUserId = fields._public_user_id;
        let ipcSectionId = fields._ipc_section_id;
        console.log("publicUserId : ", publicUserId);
        console.log("ipcSectionId : ", ipcSectionId);

        CaseDetails.findOne({
            "_public_user_id": publicUserId,
            "_ipc_section_id": ipcSectionId,
        }, function (err, obj) {
            console.log("Existing obj ", obj);
            if (err) {
                response.status(500).json({
                    status: "failed",
                    message: "Failed in Validation",
                    statusCode: 500
                });
            } else {
                console.log("Existing obj : ", obj);
                if (obj != null && !obj.case_status != 'Rejected') {
                    console.log("Current user has already filed a case on this section.");
                    response.status(200).json({
                        status: "success",
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
                            status: "failed",
                            message: "Failed to File a case",
                            statusCode: 500
                        });
                    }
                    else {
                        console.log("Case file successfully", result);
                        response.status(201).json({
                            status: "success",
                            message: "Case file successfully",
                            statusCode: 201
                        });
                    }
                });
            }
        });
    });   
}

