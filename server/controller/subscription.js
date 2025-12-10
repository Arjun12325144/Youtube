import Subscription from "../Models/subscription.js";
import { getIO } from "../socket.js";

// Toggle subscription: body must include { subscriber: userId }
export const toggleSubscription = async (req, res) => {
  const { channelId } = req.params;
  const { subscriber } = req.body;
  if (!subscriber) return res.status(400).json({ message: "Missing subscriber id" });
  try {
    const existing = await Subscription.findOne({ subscriber, channel: channelId });
    if (existing) {
      await Subscription.findByIdAndDelete(existing._id);

      // emit event
      try {
        const io = getIO();
        if (io) io.emit("subscriptionToggled", { channelId, subscriber, subscribed: false, subId: existing._id });
      } catch (e) {
        console.error("Socket emit error (unsubscribe):", e);
      }

      return res.status(200).json({ subscribed: false });
    }

    const created = await Subscription.create({ subscriber, channel: channelId });

    // emit event
    try {
      const io = getIO();
      if (io) io.emit("subscriptionToggled", { channelId, subscriber, subscribed: true, subscription: created });
    } catch (e) {
      console.error("Socket emit error (subscribe):", e);
    }

    return res.status(200).json({ subscribed: true });
  } catch (error) {
    console.error("Subscription toggle error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getSubscriptionsForUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const list = await Subscription.find({ subscriber: userId }).populate({ path: "channel", model: "user" }).exec();
    return res.status(200).json(list);
  } catch (error) {
    console.error("Get subscriptions error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getSubscriberCount = async (req, res) => {
  const { channelId } = req.params;
  try {
    // Validate channelId is a valid MongoDB ObjectId
    if (!channelId || channelId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(channelId)) {
      return res.status(400).json({ count: 0 });
    }
    const count = await Subscription.countDocuments({ channel: channelId });
    return res.status(200).json({ count });
  } catch (error) {
    console.error("Get subscriber count error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const checkIfSubscribed = async (req, res) => {
  const { channelId, userId } = req.params;
  try {
    // Validate both IDs are valid MongoDB ObjectIds
    if (!channelId || channelId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(channelId)) {
      return res.status(200).json({ subscribed: false });
    }
    if (!userId || userId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(userId)) {
      return res.status(200).json({ subscribed: false });
    }
    const exists = await Subscription.findOne({ subscriber: userId, channel: channelId });
    return res.status(200).json({ subscribed: !!exists });
  } catch (error) {
    console.error("Check subscribed error:", error);
    return res.status(200).json({ subscribed: false });
  }
};
