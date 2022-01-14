const mongoose = require('mongoose');
const bcrypt = require ('bcrypt'); 

const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        name:{
            type: String,
            required: true
        },
        email:{
            type: String,
            required: true
        },
        mobile_no:{
            type: Number,
            required: true
        },
        hashPassword:{
            type: String,
            required: true
        },
        role:{
            type: String,
            required: true
        },
        age:{
            type: Number,
            required: true
        },        
        address:{
            type: String,
            required: true
        },
        city:{
            type: String,
            required: true
        },
        pincode:{
            type: Number,
            required: true
        },
        user_status:{
            type: String,
            required: true
        },
        expertize:{
            type: String,
            required: true
        }
    }
);

UserSchema.methods.comparePassword = (password, hashPassword) => {
    return bcrypt.compareSync(password, hashPassword);
};

module.exports = mongoose.model('UserDetails', UserSchema, 'user_details');