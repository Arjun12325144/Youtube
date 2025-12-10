// import video from "../Models/video.js";
// import history from "../Models/history.js";

// export const handlehistory = async (req, res) => {
//   const { userId } = req.body;
//   const { videoId } = req.params;
//   try {
//     await history.create({ viewer: userId, videoid: videoId });
//     await video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
//     return res.status(200).json({ history: true });
//   } catch (error) {
//     console.error(" error:", error);
//     return res.status(500).json({ message: "Something went wrong" });
//   }
// };
// export const handleview = async (req, res) => {
//   const { videoId } = req.params;
//   try {
//     await video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
//   } catch (error) {
//     console.error(" error:", error);
//     return res.status(500).json({ message: "Something went wrong" });
//   }
// };
// export const getallhistoryVideo = async (req, res) => {
//   const { userId } = req.params;
//   try {
//     const historyvideo = await history
//       .find({ viewer: userId })
//       .populate({
//         path: "videoid",
//         model: "videofiles",
//       })
//       .exec();
//     return res.status(200).json(historyvideo);
//   } catch (error) {
//     console.error(" error:", error);
//     return res.status(500).json({ message: "Something went wrong" });
//   }
// };
import video from "../Models/video.js";
import history from "../Models/history.js";

export const handlehistory = async (req, res) => {
  const { userId } = req.body;
  const { videoId } = req.params;
  try {
    // Check if history already exists to prevent duplicates
    const existingHistory = await history.findOne({ viewer: userId, videoid: videoId });
    if (existingHistory) {
      return res.status(200).json({ history: true, message: "Already in history" });
    }
    
    await history.create({ viewer: userId, videoid: videoId });
    await video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
    return res.status(200).json({ history: true });
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const handleview = async (req, res) => {
  const { videoId } = req.params;
  try {
    await video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getallhistoryVideo = async (req, res) => {
  const { userId } = req.params;
  try {
    const historyvideo = await history
      .find({ viewer: userId })
      .populate({
        path: "videoid",
        model: "videofiles",
      })
      .sort({ createdAt: -1 }) // Sort by newest first
      .exec();
    return res.status(200).json(historyvideo);
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Add new delete function
export const removeHistory = async (req, res) => {
  const { historyId } = req.params;
  try {
    await history.findByIdAndDelete(historyId);
    return res.status(200).json({ message: "History removed successfully" });
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};