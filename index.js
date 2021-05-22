const express = require('express')
const app = express()
const dotenv = require('dotenv');
var cors = require('cors')
const mongoose = require('mongoose');
//import routes
const authRoute = require('./routes/auth');
const postRoute = require('./routes/dashboard');
dotenv.config();

//connect to DB
mongoose.connect(
    process.env.DB_CONNECT,
    { useNewUrlParser: true , useUnifiedTopology: true },
    ()=>{console.log("Connected to DB")}
);

app.use(cors())
//MiddleWare
app.use(express.json());
//route Middle wares
app.use('/api/user/',authRoute);
app.use('/user/',postRoute);
var port = process.env.port || 8080
app.listen(port,()=>{
    console.log('Server Running at Port ',port)
})