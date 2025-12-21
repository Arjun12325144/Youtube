import express from "express";
import { 
  deletecomment, 
  getallcomment, 
  postcomment, 
  editcomment,
  likeComment,
  dislikeComment,
  translateComment
} from "../controller/comment.js";

const routes = express.Router();

// Get comments for a video
routes.get("/:videoid", getallcomment);

// Post a new comment
routes.post("/postcomment", postcomment);

// Edit a comment
routes.post("/editcomment/:id", editcomment);

// Delete a comment
routes.delete("/deletecomment/:id", deletecomment);

// Like a comment
routes.post("/like/:id", likeComment);

// Dislike a comment
routes.post("/dislike/:id", dislikeComment);

// Translate a comment
routes.post("/translate", translateComment);

export default routes;