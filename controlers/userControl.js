const referralCodes = require('referral-codes')
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleWare/catchAsyncError");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const { sendEmail } = require("../utils/Email");
const crypto = require("crypto");
const cloudinery = require('cloudinary')
//  npm i bcryptjs validator jsonwebtoken crypto  cloudinary





exports.emailReg = catchAsyncError(async (req, resp, next) => {
  console.log('call....')
  const { email } = req.body;
  const otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
  let user = null

  user = await User.findOne({ email: email })
  const html = `your otp is ${otp}`

  if (!user) {
    user = await User.create({
      email,
      otp
    });

  } else {
    if (user.emailVerification === true) {
      return next(new ErrorHandler("Email was already registered. ", 401));
    }
    user.otp = otp;
    await user.save()
  }
  console.log(otp)
  await sendEmail({ email, subject: "Play Bazaar email verification", html })

  // sendToken(user, 201, resp);
  resp.status(201).json({
    success: true,
    user: {
      email: user.email,
      _id: user._id
    }
  });
});

//registation user
exports.registationUser = catchAsyncError(async (req, resp, next) => {

  const { name, password, email, reference } = req.body;
  let user = null

  const refer = referralCodes.generate({
    length: 7,
    count: 1,
    charset: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  });

  user = await User.findById(req.params.id).select("+password")
  if (user && user.isActive === false) {
    if (reference && user.Reference === null) {
      const referenceUser = await User.findOne({ myReference: reference })
      if (referenceUser) {
        user.balance = user.balance + 10;
        user.Reference = reference
        user.isReference = true
        referenceUser.balance = referenceUser.balance + 10
        referenceUser.save()

        await PaymentDB.create({ userId: user._id, status: "Money Added for Reference", amount: 10, fluctuation: 'Credited' });
        await PaymentDB.create({ userId: referenceUser._id, status: "Money Added for Reference", amount: 10, fluctuation: 'Credited' });

      } else {
        return next(new ErrorHandler("Refer Code is Invalid", 401));

      }
    }

    user.name = name;
    user.password = password;
    user.myReference = refer[0];
    user.isActive = true;

    await user.save()



  } else {
    return next(new ErrorHandler("Invalid User or already sign in ", 401));

  }
  console.log('call....', user)


  sendToken(user, 201, resp);
  // resp.status(201).json({
  //   success: true,
  //   user
  // });
});


exports.otpVerification = catchAsyncError(async (req, resp, next) => {
  const { email, otp } = req.body;
  // console.log(req.body.password)
  const user = await User.findOne({ email }).select("+otp")

  if (!user) {
    return next(new ErrorHandler("Invalid User ", 401));
  }
  if (user.otp !== Number(otp)) {
    return next(new ErrorHandler("Invalid otp ", 401));
  }

  user.otp = '';
  user.emailVerification = true;

  user.save()
  // sendToken(user, 200, resp);
  resp.status(201).json({
    success: true,
    user: {
      email: user.email,
      _id: user._id
    }
  });
});



// log-in User
exports.loginUser = catchAsyncError(async (req, resp, next) => {
  const { email, password } = req.body;
  // console.log(req.body.password)

  // checking if user has given email and password both;
  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email & Password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email and password", 401));
  }

  if (user.isActive === false) {
    return next(new ErrorHandler("You  are not verified or block by admin", 401));
  }

  if (user.emailVerification === false) {
    return next(new ErrorHandler("Your Email are  not verified. Please Sign in", 401));
  }

  // const isPasswordmatch =  user.comparePasswordx(password);
  const isPasswordmatch = await user.compPass(password);

  if (!isPasswordmatch) {
    return next(new ErrorHandler("Invalid email and password", 401));
  }

  sendToken(user, 200, resp);
});

//loggout User
exports.logout = catchAsyncError(async (req, resp, next) => {
  resp.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  // console.log("ok"+Date.now())
  resp.status(200).json({
    sucess: true,
    massage: "logged out",
  });
});

// Forget Password link genrating
exports.forgetPassword = catchAsyncError(async (req, resp, next) => {
  const { email } = req.body
  const otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorHandler("Invalid Email", 404));
  }

  user.otp = otp;
  await user.save();

  console.log(otp, user._id)

  await sendEmail({ email, subject: "Play Bazaar email verification for password", html: `Your Otp is ${otp}` })

  // sendToken(user, 201, resp);
  resp.status(201).json({
    success: true,
    user: {
      _id: user._id,
      email: user.email,
    }
  });

  // sendToken(user, 200, res);
});

exports.forgetPasswordGenrate = catchAsyncError(async (req, resp, next) => {
  const { id, otp } = req.body
  const password = Math.floor(Math.random() * (99999999 - 10000000 + 1)) + 10000000;

  const user = await User.findById(id).select("+otp");

  if (!user) {
    return next(new ErrorHandler("Invalid Email", 404));
  }

  if (user.otp !== Number(otp)) {
    return next(new ErrorHandler("Invalid Otp", 404));
  }
  user.otp = '';
  user.password = password;

  await user.save()

  console.log(password)
  const html = `Your New Password is ${password}`
  await sendEmail({ email: user.email, subject: "Play Bazaar email verification for password", html })

  // sendToken(user, 201, resp);
  resp.status(201).json({
    success: true,
    user
  });

  // sendToken(user, 200, res);
});

// reset password
// exports.resetPassword = catchAsyncError(async (req, res, next) => {
//   const resetPasswordToken = crypto
//     .createHash("sha256")
//     .update(req.params.token)
//     .digest("hex");

//   const user = await User.findOne({
//     resetPasswordToken,
//     resetPasswordExpire: { $gt: Date.now() },
//   });
//   if (!user) {
//     return next(
//       new ErrorHandler("Reset password token is expire or invalid", 400)
//     );
//   }

//   if (req.body.password !== req.body.confirmPassword) {
//     return next(
//       new ErrorHandler(" password and confirm password not machted", 400)
//     );
//   }

//   user.password = req.body.password;
//   user.resetPasswordToken = undefined;
//   user.resetPasswordExpire = undefined;

//   await user.save();

//   sendToken(user, 200, res);
// });

// get User Details
exports.getUserDetails = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  // console.log("getUserDetails OKEY")

  res.status(200).json({
    sucess: true,
    user,
  });
});

// password update
exports.passwordUpdate = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // const isPasswordmatch =  user.comparePasswordx(password);
  const isPasswordmatch = await user.compPass(req.body.oldPassword);

  if (!isPasswordmatch) {
    return next(new ErrorHandler("Old password is invalid", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("password and confirmPassword does not machted", 400)
    );
  }
  console.log(isPasswordmatch);

  user.password = req.body.newPassword;

  await user.save();
  sendToken(user, 200, res);
});


// profile update
exports.profileUpdate = catchAsyncError(async (req, res, next) => {
  let newUserData = {}


  const user = await User.findById(req.user.id);

  // console.log("user",req.body.avatar)

  if (req.body.avatar !== "" && req.body.avatar) {

    const imageId = user.avtar.public_id

    if (imageId) {
      await cloudinery.v2.uploader.destroy(imageId);
    }

    const myCloud = await cloudinery.v2.uploader.upload(req.body.avatar, {
      folder: "sanwariyaProfile",
      width: 150,
      crop: "scale",
    });
    user.avtar.public_id = myCloud.public_id
    user.avtar.url = myCloud.secure_url

    // console.log('update1')

    // newUserData = {
    //   name: req.body.name,
    //   email: req.body.email,
    //   phone: req.body.phone,
    //   avatar : {
    //     public_id:myCloud.public_id,
    //     url:myCloud.secure_url
    //   }
    // }

    //  
  }

  // console.log(newUserData)

  // const user = await User.findById(req.user.id)

  user.name = req.body.name;
  // user.email = req.body.email,
  user.phone = req.body.phone,


    await user.save()

  res.status(200).json({
    success: true,

  })
});


// get all user (access Admin)
exports.getAllUser = catchAsyncError(async (req, res, next) => {
  const { keyword, page } = req.query;

  const resultPerPage = 5;
  const currentPage = Number(page) || 1;
  const skip = resultPerPage * (currentPage - 1);


  const totalUsers = await User.find().count()
  const users = await User.find().limit(resultPerPage).skip(skip).sort({ createdAt: -1 });

  res.status(200).json({
    sucess: true,
    users, totalUsers, resultPerPage
  })
})

// get single user (access Admin)
exports.getsingleUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler(`User Does not exist with id : ${req.params.id}, 400`))
  }
  res.status(200).json({
    sucess: true,
    user
  })
})



// update user role ---admin
exports.updateUser = catchAsyncError(async (req, res, next) => {

  const newUserData = {
    isActive: req.body.isActive,
  }
  // console.log(newUserData)
  // we will add cloudinery letter

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  })

  res.status(200).json({
    success: true,
    user
  })
});


// delete user  ---admin
exports.deleteUser = catchAsyncError(async (req, res, next) => {

  const user = await User.findById(req.params.id);

  // //  remove image from cloudinery 
  // const imageId = user.avtar.public_id

  // if(imageId){

  //   await cloudinery.v2.uploader.destroy(imageId);
  // }

  if (!user) {
    return next(new ErrorHandler(`User Does not exist with id : ${req.params.id}, 400`))
  }

  user.isActive = false;

  await user.save();

  res.status(200).json({
    success: true,
    massage: "delete succsessfull"
  })
});
