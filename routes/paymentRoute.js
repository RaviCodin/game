const express = require("express");
const {
  emailReg,
  AddMoney,
  paymentsStatements,
  getAllPaymentAdmin,
  getWithdraws,
  getAllWithdraws,
  withdrawRequest,
  withdrawSuccess,
} = require("../controlers/paymentControler");

const { isAuthanticatedUser, authourizRoles } = require("../middleWare/auth");

const router = express.Router();
 
// router.route("/email").post(emailReg);
router.route("/money-added").post(AddMoney); // for users
router.route("/payments-statements/:userId").get(paymentsStatements); // for users


router.route("/withdraw-request/:userId").post(withdrawRequest); // for user
router.route("/withdraw-success/:withdrawId").put(withdrawSuccess); // for admin 

router.route("/get/withdraws/:userId").get(getWithdraws); // for user

//incomplete function
router.route("/all-payments").get(getAllPaymentAdmin); // for admin 
router.route("/get/all-withdraws").get(getAllWithdraws); // for admin 


module.exports = router;
