const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleWare/catchAsyncError");
const User = require("../models/userModel");
const PaymentDB = require("../models/paymentModal");
const { sendEmail } = require("../utils/Email");






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
