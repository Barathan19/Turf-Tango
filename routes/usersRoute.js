const express = require("express");
const router = express.Router();
const User = require("../models/user");
var nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

router.post("/register", async (req, res) => {
    const { name, email, password, phone } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({ name, email, password: hashedPassword, phone });
        const user = await newUser.save();
        res.send("User Registered Successfully");
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});


router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) {
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                const temp = {
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    _id: user._id
                };
                res.send(temp);
            } else {
                return res.status(400).json({ message: 'Login Failed' });
            }
        } else {
            return res.status(400).json({ message: 'Login Failed' });
        }
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});



router.get("/getallusers", async (req, res) => {
    try {
        const users = await User.find();
        res.send(users);
    } catch (error) {
        return res.status(400).json({ error });
    }
})


router.delete('/deleteuser/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        await User.findByIdAndDelete(userId);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
});




router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ message: "User not registered" });
        }
        const token = jwt.sign({ id: user._id }, "jwttokenkey", { expiresIn: '5m' })
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'barathan3127@gmail.com',
                pass: 'tgjj azzz tlkj cify'
            }
        });

        var mailOptions = {
            from: 'barathan3127@gmail.com',
            to: email,
            subject: 'Reset Password',
            text: `http://localhost:3000/resetPassword/${token}`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return res.json({ message: "error sending email" })
            } else {
                return res.json({ status: true, message: "email sent" })
            }
        });
    } catch (error) {
        console.log(error);
    }
})



router.post('/reset-password/:token', async(req, res) => {
    const {token} = req.params;
    const { password } = req.body;
    try {
        const decoded= jwt.verify(token,"jwttokenkey");
        const id=decoded.id;
        const hashPassword=await bcrypt.hash(password,10);
        await User.findByIdAndUpdate({_id:id},{password:hashPassword});
        return res.json({status:true, message:"Updated password"});
    } catch (error) {
        return res.json("invalid token");
}
})





module.exports = router;
