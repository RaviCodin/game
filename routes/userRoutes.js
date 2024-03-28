const express = require("express");
const {
  registationUser,
  loginUser,
  logout,
  forgetPassword,
  getUserDetails,
  passwordUpdate,
  profileUpdate,
  getAllUser,
  getsingleUser,
  deleteUser,
  updateUser,
  otpVerification,
  forgetPasswordGenrate,
  emailReg,
} = require("../controlers/userControl");

const { isAuthanticatedUser, authourizRoles } = require("../middleWare/auth");

const router = express.Router();
 
router.route("/email").post(emailReg);
router.route("/otp").post(otpVerification);
router.route("/register/:id").post(registationUser);

router.route("/login").post(loginUser);

router.route("/password/forget").post(forgetPassword);
router.route("/password/generate").post(forgetPasswordGenrate);
// router.route("/password/reset/:token").put(resetPassword);

router.route("/me").get(isAuthanticatedUser, getUserDetails);
router.route("/logout").get(logout);

router.route("/password/update").put(isAuthanticatedUser, passwordUpdate);
router.route("/profile/update").put(isAuthanticatedUser, profileUpdate); 

//  for admin api -----------------------------------------------------------------

router
  .route("/admin/users")
  .get(isAuthanticatedUser, getAllUser);

router
  .route("/admin/user/:id")
  .get(isAuthanticatedUser, authourizRoles("admin","user"), getsingleUser);
  
router
  .route("/admin/user/:id")
  .put(isAuthanticatedUser, authourizRoles("admin"), updateUser)
  .delete(isAuthanticatedUser, deleteUser);

module.exports = router;
