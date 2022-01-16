const CaseDetails = require('../Models/CaseDetails');

exports.fileACaseByPublic = (request, response) => {
    console.log("Filing a case begins");
    const caseDetails = new CaseDetails();
    request.on('data', (data) => {
        console.log("data._public_user_id: ", data._public_user_id.toString());
        caseDetails._public_user_id = data._public_user_id.toString();
        caseDetails._lawyer_id = data._lawyer_id;
        caseDetails._ipc_section_id = data._ipc_section_id;
        caseDetails.case_description = data.case_description;
        caseDetails.case_files = data.case_files;
    });    
    CaseDetails.findOne({
        _public_user_id: caseDetails._public_user_id,
        _ipc_section_id: caseDetails._ipc_section_id,
    }, function (err, obj) {
        console.log("Existing obj ", obj);
        if (err) {
            response.status(500).json({
                status: "failed",
                message: "Failed in Validation",
                statusCode: 500
            });
        } else {
            if (obj != null && (!obj.case_status == 'Rejected')) {
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
}

