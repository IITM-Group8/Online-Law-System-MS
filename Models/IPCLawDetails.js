const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const IPCLawSchema = new Schema(
    {
        section_no:{
            type: Number,
            required: true
        },
        description:{
            type: String,
            required: true
        }
    }
);

module.exports = mongoose.model('IPCLawDetails', IPCLawSchema, 'ipc_law');