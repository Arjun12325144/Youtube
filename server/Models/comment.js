import mongoose from "mongoose";

const commentschema = mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    videoid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videofiles",
      required: true,
    },
    commentbody: { type: String, required: true },
    usercommented: { type: String },
    commentedon: { type: Date, default: Date.now },
    // Enhanced comment features
    userCity: { type: String, default: "Unknown" },
    userCountry: { type: String, default: "Unknown" },
    originalLanguage: { type: String, default: "en" },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Auto-mark comments as deleted when dislikes >= 2
commentschema.pre('save', function(next) {
  if (this.dislikes >= 2) {
    this.isDeleted = true;
  }
  next();
});

export default mongoose.model("comment", commentschema);