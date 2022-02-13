const mongoose = require('mongoose');
const UserDetails = require('../Models/UserDetails');
const IPCLawDetails = require('../Models/IPCLawDetails');

const Schema = mongoose.Schema;

const CaseSchema = new Schema(
    {
        _public_user_id:{
            type: Schema.Types.ObjectId,
            ref: UserDetails,
            // type: String,
            // required: true            
        },
        _lawyer_id:{
            type: Schema.Types.ObjectId,
            ref: UserDetails,
            // type: String,
            // required: true
        },
        ipc_section:{
            // type: Schema.Types.ObjectId,
            // ref: IPCLawDetails,
            type: Number,
            required: true
        },
        case_description:{
            type: String,
            required: true
        },
        case_files:{
            type: Array,
            data: String,
            required: false
        },
        case_status:{
            type: String,
            required: true
        },
        created_time_stamp:{
            type: Date,
            required: true
        },
        modified_date:{
            type: Date,
            required: true
        }
    }
);

module.exports = mongoose.model('CaseDetails', CaseSchema, 'case_details');