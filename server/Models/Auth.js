import mongoose from "mongoose";

const userschema = mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String },
  phone: { type: String },
  channelname: { type: String },
  description: { type: String },
  image: { type: String },
  joinedon: { type: Date, default: Date.now },
  // Location info
  city: { type: String },
  state: { type: String },
  country: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  // Subscription plan
  currentPlan: {
    type: String,
    enum: ["free", "bronze", "silver", "gold", "premium"],
    default: "free",
  },
  watchTimeLimit: { type: Number, default: 5 }, // in minutes
  dailyDownloadLimit: { type: Number, default: 1 },
  unlimitedDownloads: { type: Boolean, default: false },
  // Download tracking
  lastDownloadDate: { type: Date },
  downloadsToday: { type: Number, default: 0 },
  // OTP verification
  otp: { type: String },
  otpExpiry: { type: Date },
  isVerified: { type: Boolean, default: false },
  // Theme preference
  preferredTheme: { type: String, enum: ["light", "dark", "auto"], default: "auto" },
});

export default mongoose.model("user", userschema);