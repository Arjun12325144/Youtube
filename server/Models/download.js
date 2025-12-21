import mongoose from "mongoose";

const downloadSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videofiles",
      required: true,
    },
    downloadedAt: { type: Date, default: Date.now },
    videoTitle: { type: String },
    videoPath: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("download", downloadSchema);
