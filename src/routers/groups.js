const express = require('express')
const Task = require('../models/task')
const Groups = require('../models/groups')
const User=require('../models/user')
const Expense=require('../models/expenses')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/groups', auth, async (req, res) => {
    const group = new Groups({
        ...req.body,
        members:[req.user]
        
    })
    console.log(group)

    try {
        await group.save()
        res.status(201).send(group)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/groups', auth, async (req, res) => {
    try {
        const groups = await Groups.find({ members: req.user })
        console.log(groups)

        res.send(groups)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

// router.get('/tasks/:id', auth, async (req, res) => {
//     const _id = req.params.id

//     try {
//         const task = await Task.findOne({ _id, owner: req.user._id })

//         if (!task) {
//             return res.status(404).send()
//         }

//         res.send(task)
//     } catch (e) {
//         res.status(500).send()
//     }
// })

// router.patch('/tasks/:id', auth, async (req, res) => {
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['description', 'completed']
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

//     if (!isValidOperation) {
//         return res.status(400).send({ error: 'Invalid updates!' })
//     }

//     try {
//         const task = await Task.findOne({ _id: req.params.id, owner: req.user._id})

//         if (!task) {
//             return res.status(404).send()
//         }

//         updates.forEach((update) => task[update] = req.body[update])
//         await task.save()
//         res.send(task)
//     } catch (e) {
//         res.status(400).send(e)
//     }
// })

// router.delete('/tasks/:id', auth, async (req, res) => {
//     try {
//         const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

//         if (!task) {
//             res.status(404).send()
//         }

//         res.send(task)
//     } catch (e) {
//         res.status(500).send()
//     }
// })
router.post('/groups/:id/addmembers',auth, async (req, res) => {
    const groupId = req.params.id;
    const { emails } = req.body;
    console.log(emails)
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
      await addFriendships(group, userIdsToAdd);
  
      res.status(200).send(group);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Server error' });
    }
  });
  
  // Helper function to add friendships between new members
  async function addFriendships(group, newMembers) {
    try {
        console.log(newMembers)
      for (const member of newMembers) {
        
        for (const otherMember of group.members) {
            console.log({member,otherMember})
          if (member.toString() !== otherMember.toString()) {
            // Check if the members are already friends
            const areFriends = await areUsersFriends(member, otherMember);
            console.log({member,otherMember})
  
            if (!areFriends) {
              // Make them friends
              await addFriendship(member, otherMember);
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
  }
  router.post('/groups/:id/addexpense',auth, async (req, res) => {
    const groupId = req.params.id;
    const { description, expenses } = req.body;
    const ownerId = req.user._id
    console.log(req.user)
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
      console.log()
  
      // Extract user IDs and expense amounts
      const expenseDetails = usersInExpense
        .filter(user => user)
        .map((user, index) => ({
          userId: user._id,
          amount: expenses[index].amount,
        }));
        console.log(expenseDetails)
  
      // Create and save expenses
      const expenseDocs = expenseDetails.map(detail => ({
        description,
        owner: ownerId,
        for: detail.userId,
        group: group._id,
        amount: detail.amount,
      }));
      console.log(expenseDocs)
  
      await Expense.insertMany(expenseDocs);
      console.log("asd")
  
      // Update amounts for the user and friends
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
      }
  
      res.status(200).send({ message: 'Expenses added successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Server error' });
    }
  });
module.exports = router