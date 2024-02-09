const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
    },

    email:{
        type:String,
        required:[true,"Please Enter Your Email"],

    },
    password:{
        type:String,
        minlength:[8,"Password Length Min 8 Character"],
        select:false
    },
    Reference:{
        type:String,
        default:null
    },
    balance:{
        type:Number,
        default:0
    },
    avatar:{
        public_id:{
            type:String,
        },
        url:{
            type:String,
        }
    },
    
    otp:{
        type:Number,
        select:false
        
    },
    isActive:{
        type:Boolean,
        default :true
    },
    
    emailVerification:{
        type:Boolean,
        default :false
    },
    role:{
        type:String,
        default:"user"
    },

    IFSCE:{
        type:String,
    },
    accountNo:{
        type:String,
    },
    accountHolderName:{
        type:String,
    },

    createAt:{
        type:Date,
        default: Date.now,
        
    },
    deleteAt:{
        type:Date,
        
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
});

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password,10);
})

//JWT Token
userSchema.methods.getJWTToken = function(){
    // console.log(process.env.JWTSECRET+" "+process.env.JWTEXPIRE)
    return jwt.sign({ id:this._id }, process.env.JWTSECRET,{ expiresIn: process.env.JWTEXPIRE })
}

// compare password
userSchema.methods.compPass = async function(enteredPassword){
    return  await bcrypt.compare(enteredPassword,this.password);
}


// genrating reset password token
userSchema.methods.getResentPasswordToken = function(){
    // generating token 
    const resetToken = crypto.randomBytes(20).toString("hex");
    
    // Hashing and adding reset token to userSchma
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    
    // console.log("ok")
    return resetToken;
}


module.exports = mongoose.model('user', userSchema)