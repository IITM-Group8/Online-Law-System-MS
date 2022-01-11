const bcrypt = require ('bcrypt');
const jwt  = require('jsonwebtoken');
const UserDetails = require('../Models/UserDetails');

exports.registerUser = (request, response) => {
    console.log("Register User begins");
    const userDetails = new UserDetails(request.body);
    console.log("User Role: ", userDetails.role);
    if(userDetails.role == 'Public'){
        userDetails.user_status = 'Active';
    }else if(userDetails.role == 'Lawyer'){
        userDetails.user_status = 'New';
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
                    return response.json({token: jwt.sign({
                        email: user.email,
                        name: user.name,
                        _id: user.id
                    },
                    'SecureAPIs')});
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

exports.getUsersByRole = (req, res) => {
    console.log("Fetch Users with role begins for : ", req.params.role);
    UserDetails.find({role: req.params.role}).then(result => {
        if(result.length <= 0){
            res.status(200).json({
                status: "success",
                message: 'User details not found for this role',
                statusCode: 200
            });
            return;
        }
        res.status(200).json({
            status: "success",
            message: 'User details fetched successfully',
            laws: result,
            statusCode: 200
        });
    }).catch(error => {
        console.log("Failed to fetch Lawyer details. ", error);
        res.status(500).json({
            status: "failed",
            message: 'Failed to fetch User details',
            statusCode: 500
        });
    });
}