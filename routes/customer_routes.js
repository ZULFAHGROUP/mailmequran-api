const express = require("express");
const router = express.Router();
const { createCustomer } = require("../controllers/customer_controllers");

router.post("/customer", createCustomer);

module.exports = router;
