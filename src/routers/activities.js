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
        .sort({ createdAt: -1 })
        .populate('owner', 'name email')
        .populate('for', 'name email')
        .populate('group', 'name')
        .lean();

        const activity = expenses.map(expense => ({
            id: expense._id, // Include the ID for marking as read
            owner: expense.owner.name,
            for: expense.for.name,
            date: expense.createdAt,
            description: expense.description,
            groupName: expense.group ? expense.group.name : 'No Group',
            amount: expense.amount,
            type: expense.owner.email === userEmail ? 'paid' : 'got',
            isRead: expense.readBy.map(id => id.toString()).includes(userId.toString())// Check if the user has read this activity
        }));

        res.json(activity);
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/activity/mark-read', auth, async (req, res) => {
    try {
        const { activityId } = req.body;
        const userId = req.user._id;

        await Expense.findByIdAndUpdate(activityId, { $addToSet: { readBy: userId } }); // Add userId to readBy if not already present

        res.status(200).json({ message: 'Activity marked as read' });
    } catch (error) {
        console.error('Error marking activity as read:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




module.exports = router;
