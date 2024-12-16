const express = require("express");
const router = express.Router();
const {
  createCustomer,
  verifyEmail,
  resendOtp,
  login,
  updateCustomer,
  getCustomer,
  startForgetPassword,
  completeForgetPassword,
  customerPreference,
  updatePreference,
  randomVerse,
} = require("../controllers/customer_controllers");
const { authorization } = require("../middlewares/authorization");

router.post("/customer", createCustomer);
router.patch("/verify-email/:email/:otp", verifyEmail);
router.patch("/resend-otp/:email", resendOtp);
router.post("/customer/login", login);
router.patch("/customer", authorization, updateCustomer);
router.get("/customer", authorization, getCustomer);
router.patch("/customer/forget-password/:email", startForgetPassword);
router.post("/customer/forget-password/complete", completeForgetPassword);
router.post("/customer/preference", authorization, customerPreference);
router.patch("/customer/preference", authorization, updatePreference);
router.get("/customer/random-verse", randomVerse);

module.exports = router;
