import express from "express";
import {
  toggleSubscription,
  getSubscriptionsForUser,
  getSubscriberCount,
  checkIfSubscribed,
} from "../controller/subscription.js";

const router = express.Router();

// Toggle subscribe/unsubscribe for the authenticated user
router.post("/:channelId", toggleSubscription);

// Get list of channels a user has subscribed to
router.get("/user/:userId", getSubscriptionsForUser);

// Get subscriber count for a channel
router.get("/count/:channelId", getSubscriberCount);

// Check if a user is subscribed to a channel
router.get("/check/:channelId/:userId", checkIfSubscribed);

export default router;
