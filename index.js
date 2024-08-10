const express = require('express')
require('./src/db/mongoose')
const userRouter = require('./src/routers/user')
const taskRouter = require('./src/routers/task')
const friendsRouter=require('./src/routers/friends')
const groupsRouter=require('./src/routers/groups')
const inspectionRouter=require('./src/routers/Insepectons')
const cors = require('cors');
const multer=require('multer');
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
  const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // 1MB file size limit
    fileFilter: (req, file, cb) => {
      checkFileType(file, cb);
    }
  }).fields([
    { name: 'tireImages', maxCount: 8 },
    { name: 'batteryImages', maxCount: 5 },
    { name: 'exteriorImages', maxCount: 5 },
    { name: 'brakeImages', maxCount: 5 },
    { name: 'engineImages', maxCount: 5 },
    { name: 'customerImages', maxCount: 5 }
  ]);


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
app.use(inspectionRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

const Task = require('./src/models/task')
const User = require('./src/models/user')




