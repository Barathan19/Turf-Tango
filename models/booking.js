const mongoose = require("mongoose");

const bookingSchema=mongoose.Schema({
    game:{
        type: String,
        required: true
    },
    gameid:{
        type: String,
        required: true
    },
    userid:{
        type: String,
        required: true
    },
    date:{
        type: String,
        required: true
    },
    fromtime:{
        type: String,
        required: true
    },
    totime:{
        type: String,
        required: true
    },
    totalamount:{
        type: Number,
        required: true
    },
    totalhours:{
        type: Number,
        required: true
    },
    transactionId:{
        type: String,
        required: true
    },
    status:{
        type: String,
        required: true,
        default: 'booked'
    }
},{
    timestamps: true
})

const bookingmodel=mongoose.model('bookings',bookingSchema);
module.exports=bookingmodel