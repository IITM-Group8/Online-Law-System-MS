const CaseDetails = require('../Models/CaseDetails');
const IPCLawDetails = require('../Models/IPCLawDetails');
const Commonconstants = require('../Constants/Commonconstants');


exports.generateReport = (request, response) => {
    console.log('Generate report begins ');
    try {
        const caseDetails = request.body;
        const ipcSection = caseDetails.ipcSection;

        var ipcSectionID = '';
        if (ipcSection) {
            IPCLawDetails.findOne({
                section_no: ipcSection
            }, function (err, obj) {
                console.log("Existing obj ", obj);
                if (err) {
                    console.log("Error in Generate report : ", err);
                    response.status(500).json({
                        status: Commonconstants.FAILED,
                        message: "Failed in Validation",
                        statusCode: 500
                    });
                } else {
                    if (obj != null) {
                        console.log("Section no. matches");
                        ipcSectionID = obj['_id'];
                    } else {
                        response.status(200).json({
                            status: Commonconstants.FAILED,
                            message: 'No Records Found for this IPC section',
                            statusCode: 401
                        });
                        return;
                    }
                    console.log("ipcSectionID : ", ipcSectionID);
                    fetchCaseDetailsByDate(caseDetails, ipcSectionID, response);
                }
            });
        } else {
            fetchCaseDetailsByDate(caseDetails, ipcSectionID, response);
        }
    } catch (error) {
        console.log("Error in Generate report : ", error);
        response.status(500).json({
            status: Commonconstants.FAILED,
            message: "Failed to Generate report",
            statusCode: 500
        });
    }
}

function fetchCaseDetailsByDate(caseDetails, ipcSectionID, response) {
    console.log("fetchCaseDetailsByDate begins for ", caseDetails, ipcSectionID);
    try {
        const fromDate = caseDetails.fromDate;
        const toDate = caseDetails.toDate;
        var input = {};
        if (fromDate && toDate && ipcSectionID) {
            input = {
                _ipc_section_id: ipcSectionID,
                created_time_stamp: {
                    $gte: new Date(fromDate),
                    $lt: new Date(toDate)
                }
            }
        } else if (fromDate && toDate && !ipcSectionID) {
            input = {
                created_time_stamp: {
                    $gte: new Date(fromDate),
                    $lt: new Date(toDate)
                }
            }
        } else if (fromDate && !toDate && ipcSectionID) {
            input = {
                _ipc_section_id: ipcSectionID,
                created_time_stamp: {
                    $gte: new Date(fromDate)
                }
            }
        } else if (fromDate && !toDate && !ipcSectionID) {
            input = {
                created_time_stamp: {
                    $gte: new Date(fromDate)
                }
            }
        } else if (!fromDate && !toDate && ipcSectionID) {
            input = {
                _ipc_section_id: ipcSectionID
            }
        }
        console.log("input query to generate reports: ", input);

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
    } catch (error) {
        console.log("Failed to fetch the Case details. ", error);
        response.status(500).json({
            status: Commonconstants.FAILED,
            message: 'Failed to fetch the Case details',
            statusCode: 500
        });
    }
}

