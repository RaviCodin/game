const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const errorMiddleWare = require('./middleWare/error');
const path = require('path')
const cors = require('cors')
const dotenv = require('dotenv');
const cloudinary = require('cloudinary');

//config
dotenv.config({path:"config/config.env"});

// app.use(express.bodyParser({limit: '50mb'}));

app.use(fileUpload());
app.use(cookieParser());

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json({limit: '900mb'}));
app.use(express.urlencoded({ extended:true }));
app.use( "*",cors({
    origin:true,
    credentials:true
}))
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET 
  });

const userRoute = require("./routes/userRoutes");

app.use("/api/v1",userRoute);


app.use(express.static(path.join(__dirname,"./build")))

app.get("*",(req,res)=>{
    res.sendFile(path.resolve(__dirname,"./build/index.html"))
})

//errorMiddleWare use 
app.use(errorMiddleWare);


module.exports = app;