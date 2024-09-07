const express = require('express');
const User = require('../models/user');
const Expense = require('../models/expense');
const Balance = require('../models/balance');
const auth = require('../middleware/auth');
const router = new express.Router();

router.get('/activity', auth, async (req, res) => {
    try {
        const userId = req.user._id;
        const userEmail = req.user.email;

        const expenses = await Expense.find({
            $or: [{ owner: userId }, { for: userId }]
        })
        .sort({ createdAt: -1 }) // Sort by date in descending order
        .populate('owner', 'name email') // Assuming User model has 'name' and 'email' fields
        .populate('for', 'name email')
        .populate('group', 'name') // Assuming Groups model has a 'name' field
        .lean(); // Convert to plain JavaScript objects for easier manipulation

        const activity = expenses.map(expense => ({
            owner: expense.owner.name,
            for: expense.for.name,
            date: expense.createdAt,
            description: expense.description,
            groupName: expense.group ? expense.group.name : 'No Group',
            amount: expense.amount,
            type: expense.owner.email === userEmail ? 'paid' : 'got'
        }));

        res.json(activity);
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});





module.exports = router;
