import SubscriptionPlan from "../Models/subscriptionPlan.js";
import User from "../Models/Auth.js";
import crypto from "crypto";
import Razorpay from "razorpay";

// Lazy initialize Razorpay
let razorpay = null;

const getRazorpay = () => {
  if (!razorpay && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log("Razorpay initialized with key:", process.env.RAZORPAY_KEY_ID);
  }
  return razorpay;
};

// Plan configurations
const PLANS = {
  free: { price: 0, watchTime: 5, downloads: 1, unlimited: false },
  bronze: { price: 10, watchTime: 7, downloads: 3, unlimited: false },
  silver: { price: 30, watchTime: 15, downloads: 10, unlimited: false },
  gold: { price: 50, watchTime: 30, downloads: 25, unlimited: false },
  premium: { price: 100, watchTime: Infinity, downloads: Infinity, unlimited: true },
};

// Get all plans
export const getPlans = async (req, res) => {
  try {
    const plans = [
      { id: "free", name: "Free", price: 0, watchTime: 5, downloads: 1, features: ["5 mins watch time", "1 download/day"] },
      { id: "bronze", name: "Bronze", price: 10, watchTime: 7, downloads: 3, features: ["7 mins watch time", "3 downloads/day"] },
      { id: "silver", name: "Silver", price: 50, watchTime: 10, downloads: 5, features: ["10 mins watch time", "5 downloads/day"] },
      { id: "gold", name: "Gold", price: 100, watchTime: -1, downloads: -1, features: ["Unlimited watch time", "Unlimited downloads"] },
      { id: "premium", name: "Premium", price: 199, watchTime: -1, downloads: -1, features: ["Unlimited watch time", "Unlimited downloads", "VoIP calls", "Screen sharing"] },
    ];
    return res.status(200).json(plans);
  } catch (error) {
    console.error("Error getting plans:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Get user's current plan
export const getUserPlan = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const activeSub = await SubscriptionPlan.findOne({
      userId,
      isActive: true,
      paymentStatus: "completed",
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      currentPlan: user.currentPlan || "free",
      watchTimeLimit: user.watchTimeLimit || 5,
      dailyDownloadLimit: user.dailyDownloadLimit || 1,
      unlimitedDownloads: user.unlimitedDownloads || false,
      subscription: activeSub,
    });
  } catch (error) {
    console.error("Error getting user plan:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Create Razorpay order
export const createOrder = async (req, res) => {
  const { userId, planId, amount } = req.body;
  const planType = planId;

  try {
    const rzp = getRazorpay();
    
    // Create Razorpay order
    if (!rzp) {
      console.error("Razorpay not initialized. KEY_ID:", process.env.RAZORPAY_KEY_ID ? "exists" : "missing", "KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "exists" : "missing");
      return res.status(500).json({ message: "Razorpay not configured. Please check server environment variables." });
    }

    const razorpayOrder = await rzp.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        planType,
        userId,
      },
    });

    const subscription = new SubscriptionPlan({
      userId,
      planType,
      amountPaid: amount,
      orderId: razorpayOrder.id,
      paymentStatus: "pending",
      watchTimeLimit: PLANS[planType]?.watchTime || 5,
      dailyDownloadLimit: PLANS[planType]?.downloads || 1,
      unlimitedDownloads: PLANS[planType]?.unlimited || false,
    });

    await subscription.save();

    return res.status(200).json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      subscriptionId: subscription._id,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ message: error.message || "Something went wrong" });
  }
};

// Verify payment and upgrade plan
export const verifyPayment = async (req, res) => {
  const { userId, planId, razorpay_order_id, razorpay_payment_id, razorpay_signature, subscriptionId } = req.body;
  const planType = planId;
  const orderId = razorpay_order_id;
  const paymentId = razorpay_payment_id || `pay_test_${Date.now()}`;

  try {
    // Verify signature if Razorpay is configured
    const rzp = getRazorpay();
    if (rzp && razorpay_signature && process.env.RAZORPAY_KEY_SECRET) {
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: "Invalid payment signature" });
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const plan = PLANS[planType];
    if (!plan) {
      return res.status(400).json({ message: "Invalid plan type" });
    }

    // Find and update subscription
    let subscription = await SubscriptionPlan.findOne({ orderId });
    if (!subscription && subscriptionId) {
      subscription = await SubscriptionPlan.findById(subscriptionId);
    }
    
    if (subscription) {
      subscription.paymentId = paymentId;
      subscription.paymentStatus = "completed";
      subscription.isActive = true;
      subscription.startDate = new Date();
      if (planType !== "free") {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        subscription.endDate = endDate;
      }
      await subscription.save();
    }

    // Update user plan
    user.currentPlan = planType;
    user.watchTimeLimit = plan.watchTime === Infinity ? -1 : plan.watchTime;
    user.dailyDownloadLimit = plan.downloads === Infinity ? -1 : plan.downloads;
    user.unlimitedDownloads = plan.unlimited;
    await user.save();

    // Generate invoice
    const invoice = {
      invoiceNumber: "INV-" + Date.now(),
      date: new Date().toISOString(),
      customerName: user.name,
      customerEmail: user.email,
      planName: planType.charAt(0).toUpperCase() + planType.slice(1),
      amount: plan.price,
      currency: "INR",
      paymentId,
      orderId,
    };

    return res.status(200).json({
      success: true,
      message: "Payment verified and plan upgraded successfully",
      plan: planType,
      invoice,
      user: {
        currentPlan: user.currentPlan,
        watchTimeLimit: user.watchTimeLimit,
        dailyDownloadLimit: user.dailyDownloadLimit,
        unlimitedDownloads: user.unlimitedDownloads,
      },
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Simulate email sending for invoice
export const sendInvoiceEmail = async (req, res) => {
  const { email, invoice } = req.body;

  try {
    // In production, use nodemailer or similar
    // For now, simulate success
    console.log(`Invoice sent to ${email}:`, invoice);

    return res.status(200).json({
      success: true,
      message: `Invoice sent to ${email}`,
    });
  } catch (error) {
    console.error("Error sending invoice:", error);
    return res.status(500).json({ message: "Failed to send invoice" });
  }
};
