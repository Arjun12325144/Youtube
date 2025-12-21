import mongoose from "mongoose";

const subscriptionPlanSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    planType: {
      type: String,
      enum: ["free", "bronze", "silver", "gold", "premium"],
      default: "free",
    },
    // Watch time limits in minutes
    watchTimeLimit: {
      type: Number,
      default: 5, // Free plan: 5 minutes
    },
    // Download limits
    dailyDownloadLimit: {
      type: Number,
      default: 1,
    },
    unlimitedDownloads: {
      type: Boolean,
      default: false,
    },
    // Payment info
    amountPaid: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    paymentId: { type: String },
    orderId: { type: String },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    // Subscription dates
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("subscriptionPlan", subscriptionPlanSchema);
