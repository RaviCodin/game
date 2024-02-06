const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleWare/catchAsyncError");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const { sendEmail } = require("../utils/Email");
const crypto = require("crypto");
const cloudinery = require('cloudinary')
//  npm i bcryptjs validator jsonwebtoken crypto  cloudinary


//registation user
exports.registationUser = catchAsyncError(async (req, resp, next) => {

  const { name, email, password } = req.body;
  console.log('call....')
  // console.log("0k ");

  // const user = await User.create({
  //   name,
  //   email,
  //   password,
  // });

  let user = {}
  // sendToken(user, 201, resp);
  resp.status(201).json({
    success: true,
    user: { name: 'wow' },
  });
});

//create account by admin 
exports.createAccountByAdmin = catchAsyncError(async (req, resp, next) => {
  const { name, email, role, region } = req.body;
  console.log('create user')

  const user = await User.create({
    name,
    email,
    role,
    region
  });

  if (!user) {
    return next(new ErrorHandler("User Not Found", 404));
  }
  // get ResetPassword Token
  const resetToken = user.getResentPasswordToken();

  await user.save({ validateBeforeSave: false });

  const createUserUrl = `${req.protocol}://${req.get("host")}/email/invited-user/${resetToken}`;

  const massage = `Create your account  Link  :- \n\n 
  <a href="${createUserUrl}">LINK</a>

  Note : Link Expire in 30 minutes.
\n`;

  try {
    // console.log("okey1 ..")
    await sendEmail({
      email: user.email,
      subject: `You have been invited to join Sanwariya Edu Consultant Portal`,
      massage,
    });
    // console.log("okey2 ..")

    resp.status(200).json({
      sucess: true,
      massage: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    console.log("error email ..")

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    next(new ErrorHandler(error.massage, 500));
  }
});
//create account by user
exports.accountCreateByUser = catchAsyncError(async (req, res, next) => {

  const { name, password } = req.body

  const resetAccountToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: resetAccountToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler("Account token is expire or invalid", 400)
    );
  }

  // if (req.body.password !== req.body.confirmPassword) {
  //   return next(
  //     new ErrorHandler(" password and confirm password not machted", 400)
  //   );
  // }

  user.name = name
  user.password = req.body.password;
  user.isActive = true;
  user.verification = 'verified';
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  console.log("okey....")
  sendToken(user, 200, res);
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
  // console.log("okey pass")
  const { email, password } = req.body
  const user = await User.findOne({ email });

  // console.log("hii.."+user)
  if (!user) {
    return next(new ErrorHandler("User Not Found", 404));
  }

  user.password = password;

  await user.save();

  sendToken(user, 200, res);


});

// reset password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler("Reset password token is expire or invalid", 400)
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandler(" password and confirm password not machted", 400)
    );
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

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

  if (req.body.avatar !== "") {

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
  user.email = req.body.email,
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
    role: req.body.role
  }
  console.log(newUserData)
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
