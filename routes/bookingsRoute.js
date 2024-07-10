const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Game = require("../models/game");
const stripe = require('stripe')('sk_test_51POYqQ061GZcuMiTkNJLS7w0QthHe8cV97aqbSNQJpGYC26LZxIkhmcyv2O6OFgeqkjvtj1cCU7cg3lCylckuK1300flcR5XVE');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'barathan3127@gmail.com',
        pass: 'tgjj azzz tlkj cify'
    }
});


router.post('/bookgame', async (req, res) => {
    const {
        game,
        userid,
        date,
        fromTime,
        toTime,
        totalHours,
        totalAmount,
        token
    } = req.body;

    try {
        
        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id
        });

        const payment = await stripe.charges.create(
            {
                amount: totalAmount * 100,
                customer: customer.id,
                currency: 'inr',
                receipt_email: token.email
            },
            {
                idempotencyKey: uuidv4()
            }
        );

        if (payment) {
            const newbooking = new Booking({
                game: game.name,
                gameid: game._id,
                userid,
                date,
                fromtime: fromTime,
                totime: toTime,
                totalamount: totalAmount,
                totalhours: totalHours,
                transactionId: payment.id
            });

            const booking = await newbooking.save();

            const gametemp = await Game.findOne({ _id: game._id });
            gametemp.currentbookings.push({
                bookingid: booking._id,
                date: date,
                fromtime: fromTime,
                totime: toTime,
                userid: userid,
                status: booking.status
            });
            await gametemp.save();

            await sendBookingConfirmationEmail(token.email, game, date, fromTime, toTime, totalHours, totalAmount);

            res.status(200).send('Payment Successful, Game Booked');
        } else {
            throw new Error('Payment failed');
        }
    } catch (error) {
        console.error('Error booking game:', error);
        res.status(400).json({ error: 'Booking failed' });
    }
});

async function sendBookingConfirmationEmail(email, game, date, fromTime, toTime, totalHours, totalAmount) {
    try {
        const token = jwt.sign({ email }, 'jwttokenkey');

        const mailOptions = {
            from: 'barathan3127@gmail.com',
            to: email,
            subject: 'Booking Confirmation',
            html: `
                <h1>Booking Confirmation</h1>
                <p>Game: ${game.name}</p>
                <p>Date: ${date}</p>
                <p>Time: ${fromTime} to ${toTime}</p>
                <p>Total Hours: ${totalHours}</p>
                <p>Total Amount: ${totalAmount}</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Booking confirmation email sent to:', email);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Could not send booking confirmation email');
    }
}


router.post('/getbookingsbyuserid',async(req,res)=>{

    const userid=req.body.userid;
    try {
        const bookings=await Booking.find({userid : userid});
        res.send(bookings);
    } catch (error) {
        return res.status(400).json({error});
    }
});


router.post('/cancelbooking',async(req,res)=>{
    const {bookingid,gameid}=req.body;
    try {
        const bookingitem=await Booking.findOne({_id : bookingid});
        bookingitem.status='cancelled';
        await bookingitem.save();
        const game=await Game.findOne({_id: gameid});
        const bookings=game.currentbookings;
        const temp=bookings.filter(booking=>booking.bookingid.toString()!=bookingid);
        game.currentbookings=temp;
        await game.save();
        res.send('Your Booking cancelled successfully');
    } catch (error) {
        return res.status(400).json({error});
    }
})

router.post('/checkoverlap', async (req, res) => {
    const { gameid, date, fromTime, toTime } = req.body;

    try {
        const existingBookings = await Booking.find({
            gameid: gameid,
            date: date,
            fromtime: { $lt: toTime },
            totime: { $gt: fromTime },
            status: 'booked'
        });

        if (existingBookings.length > 0) {
            return res.status(200).json({ overlap: true });
        } else {
            return res.status(200).json({ overlap: false });
        }
    } catch (error) {
        return res.status(400).json({ error });
    }
});


router.get('/getallbookings', async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.send(bookings);
    } catch (error) {
        console.error("Error fetching all bookings:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
})



router.post('/updatestatus', async (req, res) => {
    const { bookingId, status } = req.body;

    try {
        const booking = await Booking.findByIdAndUpdate(bookingId, { status }, { new: true });
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json({ message: 'Booking status updated successfully', booking });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;



