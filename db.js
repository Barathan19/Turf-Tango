const mongoose= require("mongoose");
var mongoURL='mongodb+srv://barathan3127:mvBwqfbIRwP8GIGc@cluster0.s6xsjse.mongodb.net/mern-games'
mongoose.connect(mongoURL,{useUnifiedTopology : true , useNewUrlParser: true})
var connection=mongoose.connection

connection.on('error',()=>{
    console.log("MongoDB Connection Failed")
})

connection.on("connected",()=>{
    console.log("MongoDB Connection Successfull")
})

module.exports=mongoose