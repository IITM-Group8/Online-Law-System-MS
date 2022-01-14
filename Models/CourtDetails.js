const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CourtSchema = new Schema(
    {
        court_type:{
            type: String,
            required: true
        },
        area:{
            type: String,
            required: true
        },
        pincode:{
            type: Number,
            required: true
        }
    }
);

module.exports = mongoose.model('CourtDetails', CourtSchema, 'court_details');