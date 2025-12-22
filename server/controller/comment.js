import comment from "../Models/comment.js";
import mongoose from "mongoose";

// Helper function to check for special characters
const hasSpecialCharacters = (text) => {
  // Allow letters, numbers, spaces, and common punctuation
  const regex = /^[a-zA-Z0-9\s.,!?'"()-\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0B00-\u0B7F\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0E00-\u0E7F\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF]*$/;
  return !regex.test(text);
};

export const postcomment = async (req, res) => {
  const { userid, videoid, commentbody, usercommented, userCity, userCountry, originalLanguage } = req.body;
  
  // Validate: Block comments with special characters
  if (hasSpecialCharacters(commentbody)) {
    return res.status(400).json({ 
      message: "Comments cannot contain special characters like @, #, $, %, etc.",
      blocked: true 
    });
  }

  try {
    const newComment = new comment({
      userid,
      videoid,
      commentbody,
      usercommented,
      userCity: userCity || "Unknown",
      userCountry: userCountry || "Unknown",
      originalLanguage: originalLanguage || "en",
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: [],
      isDeleted: false,
    });
    
    await newComment.save();
    return res.status(200).json({ comment: true, data: newComment });
  } catch (error) {
    console.error("Error posting comment:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getallcomment = async (req, res) => {
  const { videoid } = req.params;
  
  if (!videoid) {
    return res.status(400).json({ message: "Video ID is required" });
  }
  
  try {
    // Only get non-deleted comments
    const commentvideo = await comment.find({ 
      videoid: videoid,
      isDeleted: false 
    }).sort({ createdAt: -1 });
    return res.status(200).json(commentvideo);
  } catch (error) {
    console.error("Error getting comments:", error.message);
    return res.status(500).json({ message: "Error loading comments", error: error.message });
  }
};

export const deletecomment = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }
  try {
    await comment.findByIdAndDelete(_id);
    return res.status(200).json({ comment: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const editcomment = async (req, res) => {
  const { id: _id } = req.params;
  const { commentbody } = req.body;
  
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }
  
  // Validate: Block comments with special characters
  if (hasSpecialCharacters(commentbody)) {
    return res.status(400).json({ 
      message: "Comments cannot contain special characters",
      blocked: true 
    });
  }
  
  try {
    const updatecomment = await comment.findByIdAndUpdate(
      _id,
      { $set: { commentbody: commentbody } },
      { new: true }
    );
    res.status(200).json(updatecomment);
  } catch (error) {
    console.error("Error editing comment:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Like a comment
export const likeComment = async (req, res) => {
  const { id: commentId } = req.params;
  const { userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return res.status(404).json({ message: "Comment not found" });
  }

  try {
    const existingComment = await comment.findById(commentId);
    if (!existingComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const alreadyLiked = existingComment.likedBy.includes(userId);
    const alreadyDisliked = existingComment.dislikedBy.includes(userId);

    if (alreadyLiked) {
      // Remove like
      existingComment.likedBy = existingComment.likedBy.filter(
        (id) => id.toString() !== userId
      );
      existingComment.likes = Math.max(0, existingComment.likes - 1);
    } else {
      // Add like
      existingComment.likedBy.push(userId);
      existingComment.likes += 1;

      // Remove dislike if exists
      if (alreadyDisliked) {
        existingComment.dislikedBy = existingComment.dislikedBy.filter(
          (id) => id.toString() !== userId
        );
        existingComment.dislikes = Math.max(0, existingComment.dislikes - 1);
      }
    }

    await existingComment.save();
    return res.status(200).json({ 
      liked: !alreadyLiked, 
      likes: existingComment.likes,
      dislikes: existingComment.dislikes 
    });
  } catch (error) {
    console.error("Error liking comment:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Dislike a comment
export const dislikeComment = async (req, res) => {
  const { id: commentId } = req.params;
  const { userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return res.status(404).json({ message: "Comment not found" });
  }

  try {
    const existingComment = await comment.findById(commentId);
    if (!existingComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const alreadyLiked = existingComment.likedBy.includes(userId);
    const alreadyDisliked = existingComment.dislikedBy.includes(userId);

    if (alreadyDisliked) {
      // Remove dislike
      existingComment.dislikedBy = existingComment.dislikedBy.filter(
        (id) => id.toString() !== userId
      );
      existingComment.dislikes = Math.max(0, existingComment.dislikes - 1);
    } else {
      // Add dislike
      existingComment.dislikedBy.push(userId);
      existingComment.dislikes += 1;

      // Remove like if exists
      if (alreadyLiked) {
        existingComment.likedBy = existingComment.likedBy.filter(
          (id) => id.toString() !== userId
        );
        existingComment.likes = Math.max(0, existingComment.likes - 1);
      }
    }

    // Auto-delete if dislikes >= 2
    if (existingComment.dislikes >= 2) {
      existingComment.isDeleted = true;
    }

    await existingComment.save();
    
    return res.status(200).json({ 
      disliked: !alreadyDisliked, 
      likes: existingComment.likes,
      dislikes: existingComment.dislikes,
      deleted: existingComment.isDeleted 
    });
  } catch (error) {
    console.error("Error disliking comment:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Translate comment using MyMemory API (free, no API key required)
export const translateComment = async (req, res) => {
  const { text, targetLang } = req.body;

  if (!text || !targetLang) {
    return res.status(400).json({ translatedText: text, error: "Missing text or target language" });
  }

  try {
    // Using MyMemory Translation API (free, no key required)
    // Format: https://api.mymemory.translated.net/get?q=text&langpair=source|target
    const encodedText = encodeURIComponent(text);
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=auto|${targetLang}`
    );

    if (response.ok) {
      const data = await response.json();
      
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        const translatedText = data.responseData.translatedText;
        
        // Check if translation is valid (not same as original for different languages)
        if (translatedText && translatedText.toLowerCase() !== text.toLowerCase()) {
          return res.status(200).json({ translatedText });
        }
      }
      
      // If MyMemory didn't work, try Google Translate unofficial API
      const googleResponse = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodedText}`
      );
      
      if (googleResponse.ok) {
        const googleData = await googleResponse.json();
        if (googleData && googleData[0] && googleData[0][0] && googleData[0][0][0]) {
          return res.status(200).json({ translatedText: googleData[0][0][0] });
        }
      }
      
      // Fallback: return original text
      return res.status(200).json({ translatedText: text, note: "Translation service unavailable" });
    } else {
      return res.status(200).json({ translatedText: text, note: "Translation service unavailable" });
    }
  } catch (error) {
    console.error("Translation error:", error);
    // Return original text if translation fails
    return res.status(200).json({ translatedText: text, note: "Translation failed" });
  }
};