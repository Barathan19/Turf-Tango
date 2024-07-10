const express = require("express");
const router=express.Router();

const Game=require('../models/game')

router.get("/getallgames",async(req,res)=>{
    try {
        const games =await Game.find({})
        res.send(games);
    } catch (error) {
        return res.status(400).json({message: error});
    }
});


router.post("/getgamebyid",async(req,res)=>{
    const gameid=req.body.gameid
    try {
        const game =await Game.findOne({_id: gameid})
        res.send(game);
    } catch (error) {
        return res.status(400).json({message: error});
    }
});


router.post('/addgame',async(req,res)=>{
    try {
        const newgame=new Game(req.body);
        await newgame.save();
        res.send('New Game added Successfully');
    } catch (error) {
        return res.status(400).json({error});
    }
})



router.delete('/deletegame/:id', async (req, res) => {
    try {
        const gameId = req.params.id;
        await Game.findByIdAndDelete(gameId);
        res.send("Game Deleted Successfully");
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});



module.exports = router;