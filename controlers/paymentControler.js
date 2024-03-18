const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleWare/catchAsyncError");
const User = require("../models/userModel");
const PaymentDB = require("../models/paymentModal");
const WithdrawDB = require("../models/withdraw");
const { sendEmail } = require("../utils/Email");

// exports.emailReg = catchAsyncError(async (req, resp, next) => {
//   console.log('call....')
//   const { email } = req.body;
//   const otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
//   let user = null

//   user = await User.findOne({ email: email })
//   const html = `your otp is ${otp}`

//   if (!user) {
//     user = await User.create({
//       email,
//       otp
//     });

//   } else {
//     if (user.emailVerification === true) {
//       return next(new ErrorHandler("Email was already registered. ", 401));
//     }
//     user.otp = otp;
//     await user.save()
//   }
//   console.log(otp)
//   await sendEmail({ email, subject: "Play Bazaar email verification", html })

//   // sendToken(user, 201, resp);
//   resp.status(201).json({
//     success: true,
//     user: {
//       email: user.email,
//       _id: user._id
//     }
//   });
// });

exports.AddMoney = catchAsyncError(async (req, resp, next) => {
  
  const {amount} = req.body

  const price = Number(amount) 

  const user = await User.findById(req.body.userId)

  console.log('add money call....',req.body.userId)

  user.balance += price
  // user.balance = 3105
  // balance

  const addMoney = await PaymentDB.create({ userId: req.body.userId, status: "Money Added", amount: price, transductionId: req.transductionId, fluctuation: 'Credited' });

  if (user.isReference) {
    user.isReference = false;

    user.balance += 10
    await PaymentDB.create({ userId: user._id, status: "Money Added for Reference", amount: price, transductionId: req.transductionId, fluctuation: 'Credited' });

    const refUser = await User.findOne({ Reference: user.Reference })
    refUser.balance += 10
    await PaymentDB.create({ userId: refUser._id, status: "Money Added for Reference", amount: price, transductionId: req.transductionId, fluctuation: 'Credited' });

    await refUser.save();
  }

  await user.save();

  // await sendEmail({ email, subject: "Play Bazaar email verification", html })

  // sendToken(user, 201, resp);
  resp.status(201).json({
    success: true,
  });
});

exports.paymentsStatements = catchAsyncError(async (req, resp, next) => {
  console.log('add money call....')

  const statements = await PaymentDB.find({ userId: req.params.userId }).limit(20).sort({ createAt: -1 });
  // await sendEmail({ email, subject: "Play Bazaar email verification", html })
  // sendToken(user, 201, resp);
  // const stat = await PaymentDB.find({ userId: req.params.id })

  resp.status(201).json({
    success: true,
    statements,
    

  });
});


exports.getAllPaymentAdmin = catchAsyncError(async (req, res, next) => {


  // const coas = await CoaDB.find({});


  const { keyword, page } = req.query;

  const resultPerPage = 10;
  let totalPayments = null

  // const userId = req.params.id;
  const currentPage = Number(page) || 1;
  const skip = resultPerPage * (currentPage - 1);

  const allField = ["NAME", "name"];

  let allFieldsObj = [];

  allField.forEach(element => {
    const obj = {};
    obj[`${element}`] = {
      $regex: keyword,
      $options: "i",
    };
    allFieldsObj.push(obj);
  });

  const keywordData = keyword
    ? {
      "$or": allFieldsObj
    }
    : "";

  let payments = []

  if (keywordData !== "") {
    totalPayments = await PaymentDB.find(keywordData).count()
    payments = await PaymentDB.find(keywordData).limit(resultPerPage).skip(skip).sort({ Date: -1 });
  } else {
    totalPayments = await PaymentDB.find().count()
    payments = await PaymentDB.find().limit(resultPerPage).skip(skip).sort({ Date: -1 });
  }

  res.status(201).json({
    success: true,
    message: "Data Submit successfully",
    payments,
    totalPayments,
    resultPerPage
  });
});



exports.withdrawRequest = catchAsyncError(async (req, resp, next) => {
  console.log('add money call....')


  const addMoney = await WithdrawDB.create({ userId: req.params.userId, amount: req.body.amount });



  // await sendEmail({ email, subject: "Play Bazaar email verification", html })

  // sendToken(user, 201, resp);
  resp.status(201).json({
    success: true,
  });
});


exports.withdrawSuccess = catchAsyncError(async (req, resp, next) => {


  const withdraw = await WithdrawDB.findById(req.params.withdrawId)

  if (!withdraw) {
    return next(new ErrorHandler("Not Fount", 401));
  }

  const user = await User.findById(withdraw.userId)

  user.balance -= withdraw.amount

  const addMoney = await PaymentDB.create({ userId: user._id, status: "Money withdraw successful", amount: withdraw.amount, transductionId: req.body.transductionId, fluctuation: 'Credited' });

  withdraw.status = "success";

  await user.save();
  await withdraw.save();


  resp.status(201).json({
    success: true,
  });
});


exports.getWithdraws = catchAsyncError(async (req, resp, next) => {
  console.log('add money call....')


  const withdraws = await WithdrawDB.find({ userId: req.params.userId}).limit(20).sort({ createAt: -1 });

  // await sendEmail({ email, subject: "Play Bazaar email verification", html })

  // sendToken(user, 201, resp);
  resp.status(201).json({
    success: true,
    withdraws
  });
});

exports.getAllWithdraws = catchAsyncError(async (req, res , next) => {

  // const withdraws = await WithdrawDB.find();

  // const coas = await CoaDB.find({});


  const { keyword, page } = req.query;

  const resultPerPage = 10;
  let totalWithdraws = null

  // const userId = req.params.id;
  const currentPage = Number(page) || 1;
  const skip = resultPerPage * (currentPage - 1);

  const allField = ["NAME", "name"];

  let allFieldsObj = [];

  allField.forEach(element => {
    const obj = {};
    obj[`${element}`] = {
      $regex: keyword,
      $options: "i",
    };
    allFieldsObj.push(obj);
  });

  const keywordData = keyword
    ? {
      "$or": allFieldsObj
    }
    : "";

  let withdraws = []

  if (keywordData !== "") {
    totalWithdraws = await WithdrawDB.find(keywordData).count()
    withdraws = await WithdrawDB.find(keywordData).limit(resultPerPage).skip(skip).sort({ Date: -1 });
  } else {
    totalWithdraws = await WithdrawDB.find().count()
    withdraws = await WithdrawDB.find().limit(resultPerPage).skip(skip).sort({ Date: -1 });
  }

  res.status(201).json({
    success: true,
    message: "Data Submit successfully",
    withdraws,
    totalWithdraws,
    resultPerPage
  });
  
});

