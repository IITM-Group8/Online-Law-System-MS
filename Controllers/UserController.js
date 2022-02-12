const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserDetails = require('../Models/UserDetails');
const Commonconstants = require('../Constants/Commonconstants');

exports.registerUser = (request, response) => {
    console.log("Register User begins");
    try {
        const userDetails = new UserDetails(request.body);
        console.log("User Role: ", userDetails.role);
        if (userDetails.role == 'Lawyer') {
            userDetails.user_status = 'New';
        } else {
            userDetails.user_status = 'Active';
            userDetails.expertize = 'NA';
        }
        userDetails.hashPassword = bcrypt.hashSync(request.body.password, 10);

        UserDetails.findOne({
            email: userDetails.email
        }, function (err, obj) {
            if (err) {
                console.log("Error in Regiter user ", err);
                response.status(500).json({
                    status: Commonconstants.FAILED,
                    message: "Failed in Validation",
                    statusCode: 500
                });
                return;
            }
            else {
                console.log("Existing records : ", obj);
                if (obj != null && (obj.role === 'Admin')) {
                    console.log("You are not allowed to be registered as Admin");
                    response.status(409).json({
                        status: Commonconstants.FAILED,
                        message: "You are not allowed to be registered as Admin",
                        statusCode: 409
                    });
                    console.log("Register User completed");
                    return;
                }
                if (obj != null && (obj.email === userDetails.email)) {
                    console.log("User already registered: ");
                    response.status(409).json({
                        status: Commonconstants.SUCCESS,
                        message: "User is already registered",
                        statusCode: 409
                    });
                    return;
                } else {
                    userDetails.save(function (err, result) {
                        if (err) {
                            console.log("Error in saving User: ", err);
                            response.status(500).json({
                                status: Commonconstants.FAILED,
                                message: "User registration failed",
                                statusCode: 500
                            });
                            return;
                        }
                        else {
                            console.log("User Registered successfully: ", result);
                            response.status(201).json({
                                status: Commonconstants.SUCCESS,
                                message: "User Registered successfully",
                                statusCode: 201
                            });
                            return;
                        }
                    })
                }
            }
        });
    } catch (error) {
        console.log("Register USer failed", error);
        response.status(500).json({
            status: Commonconstants.FAILED,
            message: "Register USer failed",
            statusCode: 500
        });
        return;
    }
}

exports.loginUser = (request, response) => {
    console.log("Login User begins");
    try {
        UserDetails.findOne({
            email: request.body.email
        }, (err, user) => {
            if (err) {
                console.log("Error in Login user. ", err);
                response.status(500).json({
                    status: Commonconstants.FAILED,
                    message: 'Authentication Failed',
                    statusCode: 500
                });
                return;
            }
            if (!user) {
                response.status(401).json({
                    status: Commonconstants.FAILED,
                    message: "User Not Found ",
                    statusCode: 401
                });
                return;
            } else {
                console.log("User status :", user.user_status);
                if (user.comparePassword(request.body.password, user.hashPassword)) {
                    if (user.user_status == 'Active') {
                        return response.json({
                            token: jwt.sign({
                                email: user.email,
                                name: user.name,
                                _id: user.id
                            },
                                'SecureAPIs'),
                            userId: user.id,
                            email: user.email,
                            name: user.name,
                            role: user.role,
                            statusCode: 200
                        });
                    } else {
                        console.log("User status is inactive");
                        response.status(403).json({
                            status: Commonconstants.FAILED,
                            message: 'Your account is inactive. Please contact Admin.',
                            statusCode: 403
                        });
                        return;
                    }
                } else {
                    console.log("Invalid Credentials. Authentiaction failed");
                    response.status(401).json({
                        status: Commonconstants.FAILED,
                        message: 'Invalid Credentials, Please try again..',
                        statusCode: 401
                    });
                    return;
                }
            }
        });
    } catch (error) {
        console.log("Error in Login user. ", error);
        response.status(500).json({
            status: Commonconstants.FAILED,
            message: 'Failed to login User',
            statusCode: 500
        });
        return;
    }
}

exports.getUsersByRole = (request, response) => {
    try {
        const userRole = request.params.role;
        const userStatus = request.params.user_status;
        console.log(`Fetch list of Users begins for :${userRole} with the status a ${userStatus}`);
        UserDetails.find({
            role: userRole,
            user_status: userStatus
        }).then(result => {
            if (result.length <= 0) {
                response.status(200).json({
                    status: Commonconstants.FAILED,
                    message: 'User details not found for this role and status',
                    statusCode: 401
                });
                return;
            }
            var userDet = [];
            for (resultData of result) {
                var update_user = 'InActive';
                if (resultData.user_status !== 'Active') {
                    update_user = 'Active';
                }
                const det = {
                    id: resultData._id,
                    name: resultData.name,
                    email: resultData.email,
                    mobile_no: resultData.mobile_no,
                    role: resultData.role,
                    age: resultData.age,
                    address: resultData.address,
                    city: resultData.city,
                    pincode: resultData.pincode,
                    expertize: resultData.expertize,
                    user_status: resultData.user_status,
                    update_user: update_user
                }
                userDet.push(det);
            }

            response.status(200).json({
                status: Commonconstants.SUCCESS,
                message: 'User details fetched successfully',
                userDetails: userDet,
                statusCode: 200
            });
            return;
        }).catch(error => {
            console.log(`Failed to fetch ${userRole} with status as ${userStatus} details with the error: ${error}`);
            response.status(500).json({
                status: Commonconstants.FAILED,
                message: `Failed to fetch ${userRole} details`,
                statusCode: 500
            });
            return;
        });
    } catch (error) {
        console.log("Error in get User by role");
        response.status(500).json({
            status: Commonconstants.FAILED,
            message: "Failed to fetch User by role",
            statusCode: 500
        });
        return;
    }
}

exports.updateUserStatus = (request, response) => {
    const id = request.body.id;
    const userStatus = request.body.user_status;
    console.log("Update User status begins");

    UserDetails.updateOne({
        "_id": id
    }, {
        user_status: userStatus
    }, function (err, result) {
        if (err) {
            console.log("Error in updating User status ", err);
            response.status(500).json({
                status: Commonconstants.FAILED,
                message: "Failed to updating User status",
                statusCode: 500
            });
        }
        else {
            console.log("User update status: ", result);
            if (result.modifiedCount <= 0) {
                response.status(500).json({
                    status: Commonconstants.FAILED,
                    message: "Failed to updating User status",
                    statusCode: 500
                });
            } else {
                console.log("User updated successfully: ", result);
                response.status(201).json({
                    status: Commonconstants.SUCCESS,
                    message: "User status updated successfully",
                    statusCode: 201
                });
            }
        }
    });
}

exports.getLawyer = (request, response) => {
    console.log("getLawyer begins");
    try {
        const lawyerName = request.body.name;
        const expertize = request.body.expertize;
        const lawyerNameQuery = { $regex: new RegExp('.*' + lawyerName + '.*', "i") };
        const expertizeQuery = { $regex: new RegExp('.*' + expertize + '.*', "i") };

        var input = {};
        if (lawyerName && expertize) {
            input = {
                name: lawyerNameQuery,
                expertize: expertizeQuery,
                user_status: 'Active'
            }
        } else if (lawyerName && !expertize) {
            input = {
                name: lawyerNameQuery,
                user_status: 'Active'
            }
        } else if (!lawyerName && expertize) {
            input = {
                expertize: expertizeQuery,
                user_status: 'Active'
            }
        }

        UserDetails.find(input).then(result => {
            if (result.length <= 0) {
                response.status(200).json({
                    status: Commonconstants.FAILED,
                    message: 'Lawyer details not found for this role and status',
                    statusCode: 401
                });
                return;
            }
            var userDet = [];
            for (resultData of result) {
                const det = {
                    id: resultData._id,
                    name: resultData.name,
                    email: resultData.email,
                    mobile_no: resultData.mobile_no,
                    role: resultData.role,
                    age: resultData.age,
                    address: resultData.address,
                    city: resultData.city,
                    pincode: resultData.pincode,
                    expertize: resultData.expertize
                }
                userDet.push(det);
            }
            response.status(200).json({
                status: Commonconstants.SUCCESS,
                message: 'Lawyer details fetched successfully',
                lawyerDetails: userDet,
                statusCode: 200
            });
            return;
        }).catch(error => {
            console.log(`Failed to fetch lawyer details. Error: ${error}`);
            response.status(500).json({
                status: Commonconstants.FAILED,
                message: 'Failed to fetch Lawyer details',
                statusCode: 500
            });
            return;
        });
    } catch (error) {
        console.log("Failed to fetch lawyer details. ", error);
        response.status(500).json({
            status: Commonconstants.FAILED,
            message: 'Failed to fetch Lawyer details.',
            statusCode: 500
        });
        return;
    }
}

exports.generatePassword = (request, response) => {
    console.log("generatePassword begins");
    try {
        const userId = request.body.userId;
        const newPassword = request.body.newPassword;
        
        UserDetails.findOne({
            "_id": userId
        }).then(result => {
            console.log("result ", result);
            if (result.length <= 0) {
                response.status(200).json({
                    status: Commonconstants.FAILED,
                    message: 'User details not found',
                    statusCode: 401
                });
                return;
            }
            var newPwd = bcrypt.hashSync(newPassword, 10);

            UserDetails.updateOne({ "_id": userId }, { hashPassword: newPwd }, function (err, result) {
                if (err) {
                    console.log("Error in updating User password ", err);
                    response.status(500).json({
                        status: Commonconstants.FAILED,
                        message: "Failed to updating User password",
                        statusCode: 500
                    });
                    return;
                }
                else {
                    console.log("User password updated result. ", result);
                    if (result.modifiedCount <= 0) {
                        response.status(500).json({
                            status: Commonconstants.FAILED,
                            message: "Failed to updating User password",
                            statusCode: 500
                        });
                        return;
                    } else {
                        response.status(201).json({
                            status: Commonconstants.SUCCESS,
                            message: "User password updated successfully",
                            newPass: newPwd,
                            statusCode: 201
                        });
                        return;
                    }
                }
            }); 
        }).catch(error => {
            console.log(`Failed to fetch User password. Error: ${error}`);
            response.status(500).json({
                status: Commonconstants.FAILED,
                message: 'Failed to fetch User password',
                statusCode: 500
            });
            return;
        });
    } catch (error) {
        console.log("Failed to fetch User password. ", error);
        response.status(500).json({
            status: Commonconstants.FAILED,
            message: 'Failed to fetch User password.',
            statusCode: 500
        });
        return;
    }
}
