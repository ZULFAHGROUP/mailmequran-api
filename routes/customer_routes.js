const express = require("express");
const router = express.Router();
const {
  createCustomer,
  verifyEmail,
  resendOtp,
  login,
  updateCustomer,
  getCustomer,
} = require("../controllers/customer_controllers");
const { authorization } = require("../middlewares/authorization");

router.post("/customer", createCustomer);
router.patch("/verify-email/:email/:otp", verifyEmail);
router.patch("/resend-otp/:email", resendOtp);
router.post("/customer/login", login);
router.patch("/customer", authorization, updateCustomer);
router.get("/customer", authorization, getCustomer);

module.exports = router;
