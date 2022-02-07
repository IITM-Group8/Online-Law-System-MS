const CaseDetails = require('../Models/CaseDetails');
const Commonconstants = require('../Constants/Commonconstants');


exports.generateReport = (request, response) => {
    const caseDetails = request.body;
    console.log('Generate report begins ');
    const fromDate = caseDetails.fromDate;
    const toDate = caseDetails.toDate;
    const ipcSection = caseDetails.toDate;

    
    
    var input = {};
    if(publicUserId && caseStatus){
        input = {
            _public_user_id: publicUserId,
            case_status: caseStatus
        }
    }else if(lawyerUserId && caseStatus){
        input = {
            _lawyer_id: lawyerUserId,
            case_status: caseStatus
        }
    }else if(publicUserId && !caseStatus){
        input = {
            _public_user_id: publicUserId
        }
    }else if(lawyerUserId && !caseStatus){
        input = {
            _lawyer_id: lawyerUserId,
        }
    }else if(caseStatus){
        input = {
            case_status: caseStatus
        }
    }
    console.log("Query to get case details: ", input);

    CaseDetails.aggregate.lookup({
        from: "case_details", 
        localField: "_id",
        foreignField: "_ipc_section_id",
        as: "case_details"
      })

    CaseDetails.find(input).then(result => {
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


