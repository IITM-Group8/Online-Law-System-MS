const CaseDetails = require('../Models/CaseDetails');
const IPCLawDetails = require('../Models/IPCLawDetails');
const Commonconstants = require('../Constants/Commonconstants');


exports.generateReport = (request, response) => {
    console.log('Generate report begins ');
    const caseDetails = request.body;
    const ipcSectionID = caseDetails.ipcSection;
    console.log("fetchCaseDetailsByDate begins for ", caseDetails, ipcSectionID);
    try {
        const fromYear = caseDetails.fromYear;
        const toYear = caseDetails.toYear;
        var input = {};
        if (fromYear && toYear && ipcSectionID) {
            let endToDate = new Date(new Date(toYear).getFullYear(), 11, 31);
            input = {
                ipc_section: ipcSectionID,
                created_time_stamp: {
                    $gte: new Date(fromYear),
                    $lt: endToDate
                }
            }
        } else if (fromYear && toYear && !ipcSectionID) {
            let endToDate = new Date(new Date(toYear).getFullYear(), 11, 31);
            input = {
                created_time_stamp: {
                    $gte: new Date(fromYear),
                    $lt: endToDate
                }
            }
        } else if (fromYear && !toYear && ipcSectionID) {
            let tempToYear = new Date(new Date(fromYear).getFullYear(), 11, 31);
            input = {
                ipc_section: ipcSectionID,
                created_time_stamp: {
                    $gte: new Date(fromYear),
                    $lt: tempToYear
                }
            }
        } else if (fromYear && !toYear && !ipcSectionID) {
            let tempToYear = new Date(new Date(fromYear).getFullYear(), 11, 31);
            input = {
                created_time_stamp: {
                    $gte: new Date(fromYear),
                    $lt: tempToYear
                }
            }
        } else if (!fromYear && !toYear && ipcSectionID) {
            input = {
                ipc_section: ipcSectionID
            }
        }
        console.log("input query to generate reports: ", input);

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
                reports: result,
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
    } catch (error) {
        console.log("Failed to fetch the Case details. ", error);
        response.status(500).json({
            status: Commonconstants.FAILED,
            message: 'Failed to fetch the Case details',
            statusCode: 500
        });
    }    
}


