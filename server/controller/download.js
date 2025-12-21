import Download from "../Models/download.js";
import User from "../Models/Auth.js";
import Video from "../Models/video.js";
import mongoose from "mongoose";

// Check if user can download (daily limit check)
export const canDownload = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Premium/Gold users have unlimited downloads
    if (user.unlimitedDownloads || user.currentPlan === "gold" || user.currentPlan === "premium") {
      return res.status(200).json({ canDownload: true, remaining: "unlimited" });
    }

    // Check if it's a new day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastDownload = user.lastDownloadDate ? new Date(user.lastDownloadDate) : null;
    
    if (!lastDownload || lastDownload < today) {
      // New day, reset counter
      user.downloadsToday = 0;
      user.lastDownloadDate = new Date();
      await user.save();
    }

    const remaining = user.dailyDownloadLimit - user.downloadsToday;
    
    return res.status(200).json({ 
      canDownload: remaining > 0, 
      remaining,
      dailyLimit: user.dailyDownloadLimit,
      plan: user.currentPlan
    });
  } catch (error) {
    console.error("Error checking download status:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Record a download
export const recordDownload = async (req, res) => {
  const { userId, videoId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Check daily limit for non-premium users
    if (!user.unlimitedDownloads && user.currentPlan !== "gold" && user.currentPlan !== "premium") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastDownload = user.lastDownloadDate ? new Date(user.lastDownloadDate) : null;
      
      if (!lastDownload || lastDownload < today) {
        user.downloadsToday = 0;
      }

      if (user.downloadsToday >= user.dailyDownloadLimit) {
        return res.status(403).json({ 
          message: "Daily download limit reached. Upgrade to premium for unlimited downloads.",
          limitReached: true 
        });
      }
    }

    // Record the download
    const download = new Download({
      userId,
      videoId,
      videoTitle: video.videotitle,
      videoPath: video.filepath,
    });

    await download.save();

    // Update user's download count
    user.downloadsToday += 1;
    user.lastDownloadDate = new Date();
    await user.save();

    return res.status(200).json({ 
      success: true, 
      download,
      downloadsToday: user.downloadsToday,
      remaining: user.dailyDownloadLimit - user.downloadsToday
    });
  } catch (error) {
    console.error("Error recording download:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Get user's downloads
export const getUserDownloads = async (req, res) => {
  const { userId } = req.params;

  try {
    const downloads = await Download.find({ userId })
      .populate("videoId")
      .sort({ downloadedAt: -1 });

    return res.status(200).json({ downloads });
  } catch (error) {
    console.error("Error getting downloads:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Delete a download record
export const deleteDownload = async (req, res) => {
  const { downloadId } = req.params;

  try {
    await Download.findByIdAndDelete(downloadId);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting download:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
