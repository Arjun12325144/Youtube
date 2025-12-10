import video from "../Models/video.js";
import like from "../Models/like.js";
import { getIO } from "../socket.js";

export const handlelike = async (req, res) => {
  const { userId } = req.body;
  const { videoId } = req.params;
  try {
    const exisitinglike = await like.findOne({
      viewer: userId,
      videoid: videoId,
    });
    if (exisitinglike) {
      // remove like
      await like.findByIdAndDelete(exisitinglike._id);
      await video.findByIdAndUpdate(videoId, { $inc: { Like: -1 } });

      // emit socket event
      try {
        const io = getIO();
        if (io) io.emit("likeToggled", {
          videoId,
          viewer: userId,
          liked: false,
          likeId: exisitinglike._id,
        });
      } catch (e) {
        console.error("Socket emit error (unlike):", e);
      }

      return res.status(200).json({ liked: false });
    } else {
      // create like
      const created = await like.create({ viewer: userId, videoid: videoId });
      await video.findByIdAndUpdate(videoId, { $inc: { Like: 1 } });

      // populate created like with video info for frontend convenience
      const populated = await like
        .findById(created._id)
        .populate({ path: "videoid", model: "videofiles" })
        .exec();

      // emit socket event
      try {
        const io = getIO();
        if (io) io.emit("likeToggled", {
          videoId,
          viewer: userId,
          liked: true,
          like: populated,
        });
      } catch (e) {
        console.error("Socket emit error (like):", e);
      }

      return res.status(200).json({ liked: true });
    }
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getallLikedVideo = async (req, res) => {
  const { userId } = req.params;
  try {
    const likevideo = await like
      .find({ viewer: userId })
      .populate({
        path: "videoid",
        model: "videofiles",
      })
      .exec();
    return res.status(200).json(likevideo);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};