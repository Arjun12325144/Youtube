import express from "express";
import {
  getPlans,
  getUserPlan,
  createOrder,
  verifyPayment,
  sendInvoiceEmail,
} from "../controller/payment.js";

const router = express.Router();

// Get all available plans
router.get("/plans", getPlans);

// Get user's current plan
router.get("/user-plan/:userId", getUserPlan);

// Create a Razorpay order
router.post("/create-order", createOrder);

// Verify payment and upgrade plan
router.post("/verify-payment", verifyPayment);

// Send invoice email
router.post("/send-invoice", sendInvoiceEmail);

export default router;
