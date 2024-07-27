const express = require('express');
const User = require('../models/user');
const Expense = require('../models/expense');
const Balance = require('../models/balance');
const auth = require('../middleware/auth');
const router = new express.Router();

// Add an expense with a friend
router.post('/friends/addexpense/:id', auth, async (req, res) => {
    const friendId = req.params.id;
    const { description, amount } = req.body;
    const ownerId = req.user._id;

    try {
        // Create expense document
        const expenseDoc = new Expense({
            description,
            owner: ownerId,
            for: friendId,
            group: null, // Assuming no group involved in friend expenses
            amount
        });

        await expenseDoc.save();

        // Update balances
        const balance = await Balance.findOne({ owner: ownerId, for: friendId });
        if (balance) {
            balance.amount += amount;
            await balance.save();
        } else {
            await new Balance({ owner: ownerId, for: friendId, amount }).save();
        }

        const reverseBalance = await Balance.findOne({ owner: friendId, for: ownerId });
        if (reverseBalance) {
            reverseBalance.amount -= amount;
            await reverseBalance.save();
        } else {
            await new Balance({ owner: friendId, for: ownerId, amount: -amount }).save();
        }

        res.status(200).send({ message: 'Expense added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Server error' });
    }
});

// Add a settlement with a friend
router.post('/friends/addsettlement/:id', auth, async (req, res) => {
    const friendId = req.params.id;
    const { amount } = req.body;
    const ownerId = req.user._id;

    try {
        // Update balances for settlement
        const balance = await Balance.findOne({ owner: ownerId, for: friendId });
        if (balance) {
            balance.amount -= amount;
            await balance.save();
        } else {
            await new Balance({ owner: ownerId, for: friendId, amount: -amount }).save();
        }

        const reverseBalance = await Balance.findOne({ owner: friendId, for: ownerId });
        if (reverseBalance) {
            reverseBalance.amount += amount;
            await reverseBalance.save();
        } else {
            await new Balance({ owner: friendId, for: ownerId, amount }).save();
        }

        res.status(200).send({ message: 'Settlement added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Server error' });
    }
});

module.exports = router;
