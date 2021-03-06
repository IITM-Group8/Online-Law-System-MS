const IPCLawDetails = require('../Models/IPCLawDetails');
const CourtDetails = require('../Models/CourtDetails');
const Commonconstants = require('../Constants/Commonconstants');

exports.updateIPCLaw = (request, response) => {
    console.log("Update IPC Law begins");
    try {
        const ipcLawDetails = new IPCLawDetails(request.body);

        IPCLawDetails.findOne({
            section_no: ipcLawDetails.section_no
        }, function (err, obj) {
            console.log("Existing obj ", obj);
            if (err) {
                response.status(500).json({
                    status: Commonconstants.FAILED,
                    message: "Failed in Validation",
                    statusCode: 500
                });
                return;
            } else {
                if (obj != null && (obj.section_no == ipcLawDetails.section_no)) {
                    console.log("Section no. matches");
                    if (obj.description == ipcLawDetails.description) {
                        console.log("IPC Law already persisted");
                        response.status(200).json({
                            status: Commonconstants.SUCCESS,
                            message: "IPC Law already persisted",
                            statusCode: 200
                        });
                        return;
                    }
                    console.log("Updating IPC Law starts");
                    IPCLawDetails.updateOne({ "_id": obj.id }, { description: ipcLawDetails.description }, function (err, result) {
                        if (err) {
                            console.log("Error in updating IPC Law ", err);
                            response.status(500).json({
                                status: Commonconstants.FAILED,
                                message: "Failed to updating IPC Law",
                                statusCode: 500
                            });
                            return;
                        }
                        else {
                            console.log("IPC Law updated successfully", result);
                            if (result.modifiedCount <= 0) {
                                response.status(500).json({
                                    status: Commonconstants.FAILED,
                                    message: "Failed to updating IPC Law",
                                    statusCode: 500
                                });
                                return;
                            } else {
                                response.status(201).json({
                                    status: Commonconstants.SUCCESS,
                                    message: "IPC Law updated successfully",
                                    statusCode: 201
                                });
                                return;
                            }
                        }
                    });
                } else {
                    ipcLawDetails.save(function (err, result) {
                        if (err) {
                            console.log("Error in persisting IPC Law ", err);
                            response.status(500).json({
                                status: Commonconstants.FAILED,
                                message: "Failed to persist IPC Law",
                                statusCode: 500
                            });
                            return;
                        }
                        else {
                            console.log("IPC Law persisted successfully", result);
                            response.status(201).json({
                                status: Commonconstants.SUCCESS,
                                message: "IPC Law persisted successfully",
                                statusCode: 201
                            });
                            return;
                        }
                    });
                }
            }
            console.log("Update IPC Law completed");
        });
    } catch (error) {
        console.log("Error in persisting IPC Law ", err);
        response.status(500).json({
            status: Commonconstants.FAILED,
            message: "Failed to persist IPC Law",
            statusCode: 500
        });
        return;
    }
}

exports.getIPCLaws = (request, response) => {
    console.log("Fetch IPC Laws begins ");
    try {
        const ipcLawDetails = new IPCLawDetails(request.body);
        const sectionNo = ipcLawDetails.section_no;
        const description = ipcLawDetails.description;

        const descriptionQuery = { $regex: new RegExp('.*' + description + '.*', "i") };

        var input = {};
        if (sectionNo != null && description != null) {
            input = {
                section_no: sectionNo,
                description: descriptionQuery
            }
        } else if (sectionNo != null && description == null) {
            input = {
                section_no: sectionNo
            }
        } else if (sectionNo == null && description != null) {
            input = {
                description: descriptionQuery
            }
        }
        console.log("Input where details to get Law: ", input);
        IPCLawDetails.find(input).then(result => {
            console.log("IPC laws result: ", result);
            if (result.length <= 0) {
                response.status(200).json({
                    status: Commonconstants.FAILED,
                    message: 'No Records Found',
                    statusCode: 401
                });
                return;
            }
            var lawDet = [];
            for (resultData of result) {
                const det = {
                    section_no: resultData.section_no,
                    description: resultData.description
                }
                lawDet.push(det);
            }
            response.status(200).json({
                status: Commonconstants.SUCCESS,
                message: 'IPC Laws fetched successfully',
                laws: lawDet,
                statusCode: 200
            });
            return;
        }).catch(error => {
            console.log("Failed to fetch IPC Laws. ", error);
            response.status(500).json({
                status: Commonconstants.FAILED,
                message: 'Failed to fetch IPC Laws',
                statusCode: 500
            });
            return;
        });
    } catch (error) {
        console.log("Failed to fetch IPC Laws. ", error);
        response.status(500).json({
            status: Commonconstants.FAILED,
            message: 'Failed to fetch IPC Laws',
            statusCode: 500
        });
        return;
    }
}

exports.udateCourtDetails = (request, response) => {
    console.log("Update Court details begins");
    try {
        const courtDetails = new CourtDetails(request.body);

        CourtDetails.findOne({
            court_type: courtDetails.court_type,
            area: courtDetails.area,
            pincode: courtDetails.pincode
        }, function (err, obj) {
            console.log("Existing obj ", obj);
            if (err) {
                response.status(500).json({
                    status: Commonconstants.FAILED,
                    message: "Failed in Validation",
                    statusCode: 500
                });
                return;
            } else {
                if (obj != null) {
                    console.log("Court details already persisted", obj);
                    response.status(200).json({
                        status: Commonconstants.SUCCESS,
                        message: "Court details already persisted",
                        statusCode: 200
                    });
                    return;
                }
                courtDetails.save(function (err, result) {
                    if (err) {
                        console.log("Error in persisting Court details ", err);
                        response.status(500).json({
                            status: Commonconstants.FAILED,
                            message: "Failed to persist Court details",
                            statusCode: 500
                        });
                        return;
                    }
                    else {
                        console.log("Court details persisted successfully", result);
                        response.status(201).json({
                            status: Commonconstants.SUCCESS,
                            message: "Court details persisted successfully",
                            statusCode: 201
                        });
                        return;
                    }
                });
            }
        });
    } catch (error) {
        console.log("Error in persisting Court details ", error);
        response.status(500).json({
            status: Commonconstants.FAILED,
            message: "Failed to persist Court details",
            statusCode: 500
        });
        return;
    }
}

exports.getListOfCourts = (request, response) => {
    console.log("Get list of court begins");
    try {
        const areaForCourt = request.body.area;
        const pincodeForCourt = request.body.pincode;

        var input = {};
        if (areaForCourt && pincodeForCourt) {
            input = {
                area: areaForCourt,
                pincode: pincodeForCourt
            }
        } else if (areaForCourt && !pincodeForCourt) {
            input = {
                area: areaForCourt
            }
        } else if (!areaForCourt && pincodeForCourt) {
            input = {
                pincode: pincodeForCourt
            }
        }
        console.log("Fetch List Of courts by area begins for : ", input);
        CourtDetails.find(input).then(result => {
            if (result.length <= 0) {
                response.status(200).json({
                    status: Commonconstants.FAILED,
                    message: 'No Records found',
                    statusCode: 401
                });
                return;
            }
            response.status(200).json({
                status: Commonconstants.SUCCESS,
                message: 'Court details fetched successfully',
                courts: result,
                statusCode: 200
            });
            return;
        }).catch(error => {
            console.log("Failed to fetch Court details. ", error);
            response.status(500).json({
                status: Commonconstants.FAILED,
                message: `Failed to fetch Court details for ${areaForCourt}`,
                statusCode: 500
            });
            return;
        });
    } catch (error) {
        console.log("Failed to fetch Court details. ", error);
        response.status(500).json({
            status: Commonconstants.FAILED,
            message: `Failed to fetch Court details.`,
            statusCode: 500
        });
        return;
    }
}

