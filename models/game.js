const { Timestamp } = require("firebase/firestore");
const mongoose= require("mongoose");

const gameSchema=mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    maxcount: {
        type: Number,
        required: true
    },
    equipments: {
        type: String,
        required: true
    },
    amountperhour: {
        type: Number,
        required: true
    },
    imageurls: [],
    currentbookings: [],
    description: {
        type: String,
        required: true
    }
},{
    timestamps: true
})

const gameModel=mongoose.model('games',gameSchema)

module.exports=gameModel