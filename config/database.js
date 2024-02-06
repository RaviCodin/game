const mongoose = require("mongoose");

const createDBConnection = ()=>{

    
    mongoose.connect(process.env.DB_URL,{useNewUrlParser:true, useUnifiedTopology:true}).then((data)=>{
        console.log(`Database connected on : ${data.connection.host}`);

    }).catch((error)=>{
        console.log(error)
    })
}

module.exports = createDBConnection;