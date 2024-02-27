const express = require("express");
const {
  emailReg,
} = require("../controlers/paymentControler");

const { isAuthanticatedUser, authourizRoles } = require("../middleWare/auth");

const router = express.Router();
 
router.route("/email").post(emailReg);


module.exports = router;
