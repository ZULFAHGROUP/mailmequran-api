const express = require("express");
const router = express.Router();
const {
  createCustomer,
  verifyEmail,
} = require("../controllers/customer_controllers");

router.post("/customer", createCustomer);
router.patch("/verify-email/:email/:otp", verifyEmail);

module.exports = router;
