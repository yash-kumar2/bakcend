const express = require('express');
const Task = require('../models/task');
const Groups = require('../models/groups');
const User = require('../models/user');
const Expense = require('../models/expense');
const Balance = require('../models/balance');
const BalanceGroup = require('../models/balanceGroup');
const BalanceGroupFriends=require('../models/balanceGroupFriends');
const auth = require('../middleware/auth');
const router = new express.Router();
router.get('/groups', auth, async (req, res) => {
    try {
        // Find groups where the user is a member
        const groups = await Groups.find({ members: req.user._id }).populate('members', 'name');
        const userId = req.user._id;

        const groupDetails = await Promise.all(groups.map(async (group) => {
            // Calculate how much the user owes to the group
            const balanceGroup = await BalanceGroup.findOne({ owner: userId, for: group._id });
            const userBalance = balanceGroup ? balanceGroup.amount : 0;

            // Get the balance for each friend in the group using BalanceGroupFriends
            const friends = await Promise.all(group.members.map(async (member) => {
                if (member._id.toString() !== userId.toString()) {
                    const balance = await BalanceGroupFriends.findOne({ owner: userId, for: member._id, group: group._id });
                    const amount = balance ? balance.amount : 0;
                    return { name: member.name, amount };
                }
            }));

            return {
                id: group._id,
                name: group.name,
                userBalance,
                friends: friends.filter(friend => friend !== undefined)
            };
        }));
        console.log(groupDetails)

        res.status(200).send(groupDetails);
    } catch (e) {
        console.error(e);
        res.status(500).send({ error: 'Server error' });
    }
});
router.get('/groups/:id', auth, async (req, res) => {
    try {
        // Find groups where the user is a member
        const groupId = req.params.id;
        const group= await Groups.findOne({ _id:groupId}).populate('members', 'name');
        const userId = req.user._id;

        // const groupDetails = await Promise.all(groups.map(async (group) => {
        //     // Calculate how much the user owes to the group
        //     const balanceGroup = await BalanceGroup.findOne({ owner: userId, for: group._id });
        //     const userBalance = balanceGroup ? balanceGroup.amount : 0;

        //     // Get the balance for each friend in the group using BalanceGroupFriends
        //     const friends = await Promise.all(group.members.map(async (member) => {
        //         if (member._id.toString() !== userId.toString()) {
        //             const balance = await BalanceGroupFriends.findOne({ owner: userId, for: member._id, group: group._id });
        //             const amount = balance ? balance.amount : 0;
        //             return { name: member.name, amount };
        //         }
        //     }));

        //     return {
        //         id: group._id,
        //         name: group.name,
        //         userBalance,
        //         
        //     };
        // }));

        //console.log(groupDetails)
            const balanceGroup = await BalanceGroup.findOne({ owner: userId, for: groupId });
            const userBalance = balanceGroup ? balanceGroup.amount : 0;
            const friends = await Promise.all(group.members.map(async (member) => {
                if (member._id.toString() !== userId.toString()) {
                    const balance = await BalanceGroupFriends.findOne({ owner: userId, for: member._id, group: group._id });
                    const amount = balance ? balance.amount : 0;
                    return { id:member._id, name: member.name, amount };
                }
            }));
            const expense = await Expense.find({
                group: groupId,
                $or: [
                  { owner: req.user._id },       // Condition 1: where owner is req.user._id
                  { for: req.user._id }          // Condition 2: where for is req.user._id
                ]
              })
              .populate('for')           // Populate the 'for' field
              .populate('owner'); 
            const expenses=expense.map((data)=>{
                console.log(data.for._id)
                console.log(req.user._id)
                return {
                    id:data._id,
                    
                    description:data.description,
                    createdAt:data.createdAt,
                    owner:{
                        email:data.owner.email
                    },
                    for:{
                        name:data.for.name,
                        id:data.for._id
                    },
                    amount: req.user._id.equals(data.for._id) ? data.amount : -data.amount 

                }
            })
           // console.log(group)
        //    console.log(expense)
        //    console.log(req.user._id)
            
            const groupDetails={
                description:group.name,
                userBalance,
                friends: friends.filter(friend => friend !== undefined),
                expenses
            }
            //console.log(group)

        res.status(200).send(groupDetails);
    } catch (e) {
        console.error(e);
        res.status(500).send({ error: 'Server error' });
    }
});

router.post('/groups', auth, async (req, res) => {
    const group = new Groups({
        ...req.body,
        members: [req.user._id]
    });
    console.log(group);

    try {
        await group.save();
        res.status(201).send(group);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.get('/groups', auth, async (req, res) => {
    try {
        const groups = await Groups.find({ members: req.user._id });
        console.log("yash fd")
        console.log(groups);
        res.send(groups);
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});
router.get('/groups/:id',auth,async(req,res)=>{
    try{
        const groupId = req.params.id;
        console.log(req.user)
        console.log(groupId)
        console.log("ndsfa")
        const group=await Groups.findOne({id:groupId});
        const netBalance= await BalanceGroup.findOne({owner:req.user,for:groupId});
        console.log(netBalance)
        res.status(200).send(netBalance)


    }
    catch{
        return res.status(404)
    }
})
router.get('/groups/:id/members',auth,async (req,res)=>{
    const groupId=req.params.id;
    console.log("here23")
    try{
    const group=await Groups.findOne({_id:groupId,members:req.user._id}).populate({
        path: 'members',
        select: 'id name email'
      });
    console.log(group)
    res.status(200).send(group)
    }
    catch{
        return res.status(404)

    }
})

router.post('/groups/:id/members', auth, async (req, res) => {
  console.log("FD")
    const groupId = req.params.id;
    const { emails } = req.body;
    console.log(emails);
    try {
        const group = await Groups.findById(groupId);

        if (!group) {
            return res.status(404).send({ error: 'Group not found' });
        }

        // Find existing members in the group
        const existingMembers = group.members.map(member => member.toString());

        // Find users by emails
        const usersToAdd = await Promise.all(emails.map(email => User.findOne({ email })));

        const userIdsToAdd = [];
        const newMembers = [];

        // Extract user IDs from the found users and check if they are already in the group
        for (const user of usersToAdd) {
            if (user && !existingMembers.includes(user._id.toString())) {
                userIdsToAdd.push(user._id);
                newMembers.push(user);
            }
        }

        if (userIdsToAdd.length === 0) {
            return res.status(400).send({ error: 'No new members to add' });
        }

        // Add new members to the group
        group.members.push(...userIdsToAdd);
        await group.save();

        // Check and add friendships between new members
        await addFriendships(group, newMembers);

        // Create BalanceGroup documents for new members
        for (const userId of userIdsToAdd) {
            const balanceGroup = new BalanceGroup({
                owner: userId,
                for: group._id,
                amount: 0
            });
            await balanceGroup.save();
        }

        res.status(200).send(group);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Server error' });
    }
});

// Helper function to add friendships between new members
async function addFriendships(group, newMembers) {
    try {
        for (const member of newMembers) {
            for (const otherMember of group.members) {
                if (member._id.toString() !== otherMember.toString()) {
                    // Check if the members are already friends
                    const areFriends = await areUsersFriends(member._id, otherMember);

                    if (!areFriends) {
                        // Make them friends and create Balance documents
                        await addFriendship(member._id, otherMember);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error adding friendships:', error);
    }
}

// Function to check if two users are friends
async function areUsersFriends(userId1, userId2) {
    const user1 = await User.findById(userId1);
    const user2 = await User.findById(userId2);

    if (!user1 || !user2) {
        throw new Error('One or both users not found');
    }

    return user1.friends.includes(userId2) && user2.friends.includes(userId1);
}

// Function to add friendship between two users
async function addFriendship(userId1, userId2) {
    const user1 = await User.findById(userId1);
    const user2 = await User.findById(userId2);

    if (!user1 || !user2) {
        throw new Error('One or both users not found');
    }

    // Add userId2 to user1's friends array and userId1 to user2's friends array
    user1.friends.push(userId2);
    user2.friends.push(userId1);

    await user1.save();
    await user2.save();

    // Create Balance documents for the new friendship
    const balance1 = new Balance({
        owner: userId1,
        for: userId2,
        amount: 0
    });
    const balance2 = new Balance({
        owner: userId2,
        for: userId1,
        amount: 0
    });

    await balance1.save();
    await balance2.save();
}

router.post('/groups/:id/addexpense', auth, async (req, res) => {
    const groupId = req.params.id;
    const { description, expenses,payerEmail } = req.body;
    console.log("sdfsdfsfs")
    console.log(payerEmail)

    let ownerId = await User.findOne({email:payerEmail})
    ownerId=ownerId._id
    console.log(ownerId);
    try {
        // Find the group by ID
        const group = await Groups.findById(groupId);

        if (!group) {
            return res.status(404).send({ error: 'Group not found' });
        }

        // Validate and find users by emails in expenses
        const usersInExpense = await Promise.all(
            expenses.map(expense => User.findOne({ email: expense.email }))
        );

        // Extract user IDs and expense amounts
        const expenseDetails = usersInExpense
            .filter(user => user)
            .map((user, index) => ({
                userId: user._id,
                amount: expenses[index].amount,
            }));
        console.log(expenseDetails);

        // Create and save expenses
        const expenseDocs = expenseDetails.map(detail => ({
            description,
            owner: ownerId,
            for: detail.userId,
            group: group._id,
            amount: detail.amount,
        }));
        console.log(expenseDocs);

        await Expense.insertMany(expenseDocs);
        console.log("Expenses added");

        // Update group balance for the owner
        const totalGroupAmount = expenseDetails.reduce((sum, detail) => parseInt(sum) + parseInt(detail.amount), 0);
        const balanceGroup = await BalanceGroup.findOne({ owner: ownerId, for: groupId });
        if (balanceGroup) {
            balanceGroup.amount += totalGroupAmount;
            await balanceGroup.save();
        } else {
            await new BalanceGroup({ owner: ownerId, for: groupId, amount: totalGroupAmount }).save();
        }

        // Update balances for the user and friends
        for (const detail of expenseDetails) {
            const user = await User.findById(detail.userId);
            const owner = await User.findById(ownerId);
            

            // Update the amount in the owner's friend list
            let ownerFriend = owner.friends.find(
                friend => friend._id.toString() === detail.userId.toString()
            );
            if (ownerFriend) {
                ownerFriend.amount += detail.amount;
            } else {
                owner.friends.push({ _id: detail.userId, amount: detail.amount });
            }
            await owner.save();

            // Update the amount in the friend's friend list
            let friend = user.friends.find(
                friend => friend._id.toString() === ownerId.toString()
            );
            if (friend) {
                friend.amount += detail.amount;
            } else {
                user.friends.push({ _id: ownerId, amount: detail.amount });
            }
            await user.save();

            // Update Balance documents
            const balance = await Balance.findOne({ owner: ownerId, for: detail.userId });
            if (balance) {
                balance.amount=parseInt(balance.amount)
                balance.amount += parseInt(detail.amount);
                await balance.save();
            } else {
                await new Balance({ owner: ownerId, for: detail.userId, amount: detail.amount }).save();
            }

            const reverseBalance = await Balance.findOne({ owner: detail.userId, for: ownerId });
            if (reverseBalance) {
                reverseBalance.amount -= detail.amount;
                await reverseBalance.save();
            } else {
                await new Balance({ owner: detail.userId, for: ownerId, amount: -detail.amount }).save();
            }

            // Update BalanceGroup for the friend
            const friendBalanceGroup = await BalanceGroup.findOne({ owner: detail.userId, for: groupId });
            if (friendBalanceGroup) {
                friendBalanceGroup.amount = -parseInt(detail.amount)+parseInt(friendBalanceGroup.amount);
                await friendBalanceGroup.save();
            } else {
                await new BalanceGroup({ owner: detail.userId, for: groupId, amount: -detail.amount }).save();
            }

            // Update BalanceGroupFriends for the owner
            const balanceGroupFriend = await BalanceGroupFriends.findOne({ owner: ownerId, for: detail.userId, group: groupId });
            if (balanceGroupFriend) {
                balanceGroupFriend.amount = parseInt(balanceGroupFriend.amount)+parseInt(detail.amount);
                await balanceGroupFriend.save();
            } else {
                await new BalanceGroupFriends({ owner: ownerId, for: detail.userId, group: groupId, amount: detail.amount }).save();
            }

            // Update BalanceGroupFriends for the friend
            const reverseBalanceGroupFriend = await BalanceGroupFriends.findOne({ owner: detail.userId, for: ownerId, group: groupId });
            if (reverseBalanceGroupFriend) {
                reverseBalanceGroupFriend.amount -= detail.amount;
                await reverseBalanceGroupFriend.save();
            } else {
                await new BalanceGroupFriends({ owner: detail.userId, for: ownerId, group: groupId, amount: -detail.amount }).save();
            }
        }

        res.status(200).send({ message: 'Expenses added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Server error' });
    }
});

router.post('/groups/:id/addsettlement', auth, async (req, res) => {
  const groupId = req.params.id;
  const { description, expenses } = req.body;
  const ownerId = req.user._id;
  console.log(req.user);
  try {
      // Find the group by ID
      const group = await Groups.findById(groupId);

      if (!group) {
          return res.status(404).send({ error: 'Group not found' });
      }

      // Validate and find users by emails in expenses
      const usersInExpense = await Promise.all(
          expenses.map(expense => User.findOne({ email: expense.email }))
      );

      // Extract user IDs and expense amounts
      const expenseDetails = usersInExpense
          .filter(user => user)
          .map((user, index) => ({
              userId: user._id,
              amount: expenses[index].amount,
          }));
      console.log(expenseDetails);

      // Create and save expenses
      const expenseDocs = expenseDetails.map(detail => ({
          description,
          owner: ownerId,
          for: detail.userId,
          group: group._id,
          amount: detail.amount,
          type:"settlement"
      }));
      console.log(expenseDocs);

      await Expense.insertMany(expenseDocs);
      console.log("asd");

      // Update group balance
      const totalGroupAmount = expenseDetails.reduce((sum, detail) => sum + detail.amount, 0);
      const balanceGroup = await BalanceGroup.findOne({ owner: ownerId, for: groupId });
      if (balanceGroup) {
          balanceGroup.amount += totalGroupAmount;
          await balanceGroup.save();
      } else {
          await new BalanceGroup({ owner: ownerId, for: groupId, amount: totalGroupAmount }).save();
      }

      // Update balances for the user and friends
      for (const detail of expenseDetails) {
          const user = await User.findById(detail.userId);
          const owner = await User.findById(ownerId);

          // Update the amount in the owner's friend list
          let ownerFriend = owner.friends.find(
              friend => friend._id.toString() === detail.userId.toString()
          );
          if (ownerFriend) {
              ownerFriend.amount += detail.amount;
          } else {
              owner.friends.push({ _id: detail.userId, amount: detail.amount });
          }
          await owner.save();

          // Update the amount in the friend's friend list
          let friend = user.friends.find(
              friend => friend._id.toString() === ownerId.toString()
          );
          if (friend) {
              friend.amount += detail.amount;
          } else {
              user.friends.push({ _id: ownerId, amount: detail.amount });
          }
          await user.save();

          // Update Balance documents
          const balance = await Balance.findOne({ owner: ownerId, for: detail.userId });
          if (balance) {
              balance.amount += detail.amount;
              await balance.save();
          } else {
              await new Balance({ owner: ownerId, for: detail.userId, amount: detail.amount }).save();
          }

          const reverseBalance = await Balance.findOne({ owner: detail.userId, for: ownerId });
          if (reverseBalance) {
              reverseBalance.amount -= detail.amount;
              await reverseBalance.save();
          } else {
              await new Balance({ owner: detail.userId, for: ownerId, amount: -detail.amount }).save();
          }
      }
      //const balance2 = await Balance.findOne({ owner: ownerId, for: detail.userId });
       //console.log(balance2)
      res.status(200).send({ message: 'Expenses added successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Server error' });
  }
});
module.exports = router;
