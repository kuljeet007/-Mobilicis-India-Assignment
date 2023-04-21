const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost/sample_db', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));



// Middleware
app.use(cors());
app.use(express.json());
const User = require('./models/User');
// Routes
app.get('/income-bmw-mercedes', async (req, res) => {
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
app.get('/male-phone-price', async (req, res) => {
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
app.get('/last-name-M', async (req, res) => {
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

app.get('/car-brand-email', async (req, res) => {
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
app.get('/top-cities', async (req, res) => {
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

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
