const bcrypt = require ('bcrypt');
const jwt  = require('jsonwebtoken');
const UserDetails = require('../Models/UserDetails');

exports.registerUser = (request, response) => {
    console.log("Register User begins");
    const userDetails = new UserDetails(request.body);
    console.log("User Role: ", userDetails.role);
    if(userDetails.role == 'Lawyer'){
        userDetails.user_status = 'New';
    }else {
        userDetails.user_status = 'Active';
        userDetails.specialization = 'NA';
    }
    userDetails.hashPassword = bcrypt.hashSync(request.body.password, 10);

    UserDetails.findOne({
        email: userDetails.email
    }, function (err, obj) {
        if (err) {
            response.status(500).json({
                status: "failed",
                message: "Failed in Validation",
                statusCode: 500
            });
        }
        else {
            console.log("Existing records : ", obj);
            if (obj != null && (obj.role === 'Admin')) {
                console.log("You are not allowed to be registered as Admin");
                response.status(409).json({
                    status: "failed",
                    message: "You are not allowed to be registered as Admin",
                    statusCode: 409
                });
                console.log("Register User completed");
                return;
            }
            if (obj != null && (obj.email === userDetails.email)) {
                console.log("User already registered: ");
                response.status(409).json({
                    status: "success",
                    message: "User is already registered",
                    statusCode: 409
                });
            } else {
                userDetails.save(function (err, result) {
                    if (err) {
                        console.log("Error in saving User: ", err);
                        response.status(500).json({
                            status: "failed",
                            message: "User registration failed",
                            statusCode: 500
                        });
                    }
                    else {
                        console.log("User Registered successfully: ", result);
                        response.status(201).json({
                            status: "success",
                            message: "User Registered successfully",
                            statusCode: 201
                        });
                    }
                })
            }
        }
    });
}

exports.loginUser = (request, response) => {
    console.log("Login User begins");
    UserDetails.findOne({
        email: request.body.email
    },(err, user) => {
        if (err){
            response.status(500).json({
                status: "failed",
                message: 'Authentication Failed',
                statusCode: 500
            });
            throw err;
        }
        if(!user){
            response.status(401).json({
                status: "failed",
                message: "User Not Found ",
                statusCode: 401
            })
        }else{
            console.log("User status :", user.user_status);
            if (user.comparePassword(request.body.password, user.hashPassword)
                && user.user_status == 'Active'){
                    return response.json({
                        token: jwt.sign({
                        email: user.email,
                        name: user.name,
                        _id: user.id
                    },
                    'SecureAPIs'),
                    role: user.role
                });
            }else{
                console.log("Invalid Credentials. Authentiaction failed");
                response.status(401).json({
                    status: "failed",
                    message: 'Invalid Credentials, Please try again..',                    
                    statusCode: 401
                });
            }            
        }
    })
}

exports.getUsersByRole = (request, response) => {
    const userRole = request.params.role;
    const userStatus = request.params.user_status;
    console.log(`Fetch list of Users begins for :${userRole} with the status a ${userStatus}`);
    UserDetails.find({
        role: userRole,
        user_status: userStatus
    }).then(result => {
        if(result.length <= 0){
            response.status(200).json({
                status: "success",
                message: 'User details not found for this role and status',
                statusCode: 200
            });
            return;
        }
        response.status(200).json({
            status: "success",
            message: 'User details fetched successfully',
            laws: result,
            statusCode: 200
        });
    }).catch(error => {
        console.log(`Failed to fetch ${userRole} with status as ${userStatus} details with the error: ${error}`);
        response.status(500).json({
            status: "failed",
            message: `Failed to fetch ${userRole} details`,
            statusCode: 500
        });
    });
}

// Work in progress
exports.updateUserStatus = (request, response) => {
    const id = request.params.id;
    const userStatus = request.params.user_status;
    console.log("Update IPC Law begins");

    UserDetails.findOne({
        section_no: ipcLawDetails.section_no
    }, function (err, obj) {
        console.log("Existing obj ", obj);
        if (err) {
            response.status(500).json({
                status: "failed",
                message: "Failed in Validation",
                statusCode: 500
            });
        }else {
            if (obj != null && (obj.section_no == ipcLawDetails.section_no)) {
                console.log("Section no. matches");
                if(obj.description == ipcLawDetails.description){
                    console.log("IPC Law already persisted");
                    response.status(200).json({
                        status: "success",
                        message: "IPC Law already persisted",
                        statusCode: 200
                    });
                    return;
                }
                console.log("Updating IPC Law starts");
                IPCLawDetails.updateOne({"_id": obj.id}, {description: ipcLawDetails.description}, function (err, result) {
                    if (err) {
                        console.log("Error in updating IPC Law ", err);
                        response.status(500).json({
                            status: "failed",
                            message: "Failed to updating IPC Law",
                            statusCode: 500
                        });
                    }
                    else {
                        console.log("IPC Law updated successfully", result);
                        if(result.modifiedCount <= 0){
                            response.status(500).json({
                                status: "failed",
                                message: "Failed to updating IPC Law",
                                statusCode: 500
                            });
                        }else{
                            response.status(201).json({
                                status: "success",
                                message: "IPC Law updated successfully",
                                statusCode: 201
                            });
                        }                        
                    }
                });
            }else{
                ipcLawDetails.save(function (err, result) {
                    if (err) {
                        console.log("Error in persisting IPC Law ", err);
                        response.status(500).json({
                            status: "failed",
                            message: "Failed to persist IPC Law",
                            statusCode: 500
                        });
                    }
                    else {
                        console.log("IPC Law persisted successfully", result);
                        response.status(201).json({
                            status: "success",
                            message: "IPC Law persisted successfully",
                            statusCode: 201
                        });
                    }
                });
            }            
        }
        console.log("Update IPC Law completed");
    });
}