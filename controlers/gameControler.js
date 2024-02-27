const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleWare/catchAsyncError");
const User = require("../models/userModel");
const GameStackDB = require("../models/gameStack");
const GameHistoryDB = require("../models/gamesHistory");
const GameResultDB = require("../models/gameResults");
const PaymentDB = require("../models/paymentModal");
const { sendEmail } = require("../utils/Email");
const moment = require("moment");


exports.createGame = catchAsyncError(async (req, resp, next) => {
    console.log(req.body)
    
    const bet = await GameStackDB.insertMany(req.body.bet)

    const betHis = await GameHistoryDB.insertMany(req.body.bet)

    if (!bet) {
        return next(new ErrorHandler("Game Error", 401));
    }
    const user = await User.findById(req.body.userId)

    user.balance = user.balance - req.body.totalPrice

    await user.save()

    resp.status(201).json({
        success: true,
        message: "your bet successfully created"
    });
});

exports.results = catchAsyncError(async (req, resp, next) => {
    const { gameCategory, luckyNum } = req.body  // gameCategory = location -- ghaziabad

    const myDate = new Date()
    const todayDate = moment(myDate).format('MM DD YYYY');

    const todayGameResult = await GameResultDB.find({ createAt: todayDate, gameCategory: gameCategory })
    console.log(todayDate, todayGameResult)

    if (todayGameResult.length !== 0) {
        return next(new ErrorHandler("This Game is Already Created today. try next day", 401));
    }

    const GameResult = await GameResultDB.create({ gameCategory: gameCategory, adminId: req.user._id })


    //  game winning logic ----------------------------------------
    // const betWinners = await GameStackDB.find({betNo:luckyNum});

    // betWinners.forEach( async (item)  => {
    //     const user = await User.findById(item.userId);
    //     user.balance +=  item.betNo * 95;
    // });

    // logic for haruf 
    const num = luckyNum.toString();
    const betNumA = num[0] + 'A'
    const betNumB = num[1] + 'B'
    const betNumAB = num[0] + 'AB'
    const betNumBA = num[1] + 'AB'

    const betWinners = await GameStackDB.find({
        $or: [
            { betNo: betNumA },
            { betNo: betNumB },
            { betNo: betNumAB },
            { betNo: betNumBA },
            { betNo: luckyNum.toString() },
        ]
    });

    betWinners.forEach(async (item) => {
        const user = await User.findById(item.userId);
        user.balance += item.betPrice * 95;

        const payment = await PaymentDB.create({ userId: item.userId, status: "Your win bet.", amount: item.betPrice * 95, fluctuation: 'Add' });


        await user.save()


    });


    await GameStackDB.deleteMany({ gameCategory: gameCategory });



    resp.status(201).json({
        success: true,
        message: `Result created successfully for Number : ${luckyNum}.`
    });
});


exports.getResults = catchAsyncError(async (req, resp, next) => {


    const myDate = new Date(req.body.date)

    const todayDate = moment(myDate).format('MM DD YYYY'); //'20-01-2024'
    console.log(myDate, todayDate)

    const results = await GameResultDB.find({ createAt: todayDate, gameCategory: req.body.gameCategory })
    // const results = await GameResultDB.find({})

    if (!results) {
        return next(new ErrorHandler("Results not found", 401));
    }

    resp.status(201).json({
        success: true,
        results
    });
});

exports.getMyGames = catchAsyncError(async (req, resp, next) => {

    const bets = await GameStackDB.find({ userId: req.params.userId })

    if (!bets) {
        return next(new ErrorHandler("Game Error", 401));
    }

    resp.status(201).json({
        success: true,
        bets
    });
});

exports.getDailyGame = catchAsyncError(async (req, resp, next) => {

    const bets = await GameStackDB.find()

    if (!bets) {
        return next(new ErrorHandler("Game Error", 401));
    }

    resp.status(201).json({
        success: true,
        bets
    });
});

exports.getAllGameHistory = catchAsyncError(async (req, resp, next) => {

    const bets = await GameHistoryDB.find().sort({ createAt: -1 })

    if (!bets) {
        return next(new ErrorHandler("Game Error", 401));
    }

    resp.status(201).json({
        success: true,
        bets
    });
});