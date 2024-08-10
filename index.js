const express = require('express')
require('./src/db/mongoose')
const userRouter = require('./src/routers/user')
const taskRouter = require('./src/routers/task')
const friendsRouter=require('./src/routers/friends')
const groupsRouter=require('./src/routers/groups')
const cors = require('cors');

const app = express()
const port = process.env.PORT || 3000

// app.use((req, res, next) => {
//     if (req.method === 'GET') {
//         res.send('GET requests are disabled')
//     } else {
//         next()
//     }
// })

// app.use((req, res, next) => {
//     res.status(503).send('Site is currently down. Check back soon!')
// })
app.use(cors());
app.options('*', cors());
app.use(express.json())
app.use(userRouter)
app.use(groupsRouter)
app.use(friendsRouter)


app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

const Task = require('./src/models/task')
const User = require('./src/models/user')



