const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const groupsRouter=require('./routers/groups')

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

app.use(express.json())
app.use(userRouter)
app.use(groupsRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

const Task = require('./models/task')
const User = require('./models/user')



