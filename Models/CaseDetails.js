const mongoose = require('mongoose');
const UserDetails = require('../Models/UserDetails');
const IPCLawDetails = require('../Models/IPCLawDetails');

const Schema = mongoose.Schema;

const CaseSchema = new Schema(
    {
        _public_user_id:{
            type: Schema.Types.ObjectId,
            required: true,
            ref: UserDetails
        },
        _lawyer_id:{
            type: Schema.Types.ObjectId,
            required: true,
            ref: UserDetails
        },
        _ipc_section_id:{
            type: Schema.Types.ObjectId,
            required: true,
            ref: IPCLawDetails
        },
        case_description:{
            type: String,
            required: true
        },
        case_files:{
            type: Array,
            required: false
        },
        case_status:{
            type: String,
            required: true
        }
    }
);

module.exports = mongoose.model('CaseDetails', CaseSchema, 'case_details');