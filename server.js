const app = require("./app")
const dotenv = require('dotenv')
const createDBConnection = require("./config/database");
const Razorpay = require('razorpay')

createDBConnection();

const PORT = process.env.PORT  || 5000





app.listen(PORT, ()=>{
    console.log(`server is working on http://localhost:${process.env.PORT}`)
})