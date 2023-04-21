const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Route 1: Users which have income lower than $5 USD and have a car of brand “BMW” or “Mercedes”.
router.get('/income-bmw-mercedes', async (req, res) => {
    try {
        const users = await User.find({
            $and: [
                { income: { $lt: '$5' } },
                { $or: [{ car: 'BMW' }, { car: 'Mercedes' }] }
            ]
        });
        res.json(users);
    } catch (err) {
        res.json({ message: err });
    }
});

// Route 2: Male Users which have phone price greater than 10,000.
router.get('/male-phone-price', async (req, res) => {
    try {
        const users = await User.find({
            $and: [
                { gender: 'Male' },
                { phone_price: { $gt: '10000' } }
            ]
        });
        res.json(users);
    } catch (err) {
        res.json({ message: err });
    }
});

// Route 3: Users whose last name starts with “M” and has a quote character length greater than 15 and email includes his/her last name.
router.get('/last-name-M', async (req, res) => {
    try {
        const users = await User.find({
            last_name: { $regex: /^M/ },
            quote: { $exists: true, $regex: /.{15,}/ },
            email: { $regex: /M$/ }
        });

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//--------------

router.get('/car-brand-email', async (req, res) => {
    try {
        const users = await User.find({
            car: { $in: ['BMW', 'Mercedes', 'Audi'] },
            email: { $not: /\d/ }
        });

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//--------------------
router.get('/top-cities', async (req, res) => {
    try {
        const cities = await User.aggregate([
            { $group: { _id: '$city', count: { $sum: 1 }, total_income: { $sum: '$income' } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $project: { _id: 0, city: '$_id', count: 1, average_income: { $divide: ['$total_income', '$count'] } } }
        ]);

        res.json(cities);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
