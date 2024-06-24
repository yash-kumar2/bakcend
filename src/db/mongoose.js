const mongoose = require('mongoose')

// mongoose.connect(, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false
// })

mongoose.connect('mongodb://127.0.0.1:27017/splitwise', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

// Define a simple route to test the connection
