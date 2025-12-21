"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { 
  ThumbsUp, 
  ThumbsDown, 
  Languages, 
  MapPin, 
  Loader2,
  AlertCircle 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface Comment {
  _id: string;
  videoid: string;
  userid: string;
  commentbody: string;
  usercommented: string;
  commentedon: string;
  userCity?: string;
  userCountry?: string;
  originalLanguage?: string;
  likes: number;
  dislikes: number;
  likedBy?: string[];
  dislikedBy?: string[];
  isDeleted?: boolean;
}

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "kn", name: "Kannada" },
  { code: "ml", name: "Malayalam" },
  { code: "mr", name: "Marathi" },
  { code: "bn", name: "Bengali" },
  { code: "gu", name: "Gujarati" },
  { code: "pa", name: "Punjabi" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
];

// Helper to check for special characters
const hasSpecialCharacters = (text: string): boolean => {
  const regex = /[@#$%^&*()+=\[\]{};':"\\|<>\/?~`]/;
  return regex.test(text);
};

const Comments = ({ videoId }: { videoId: string }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(true);
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ city: string; country: string } | null>(null);
  
  const { user } = useUser();

  useEffect(() => {
    loadComments();
    fetchUserLocation();
  }, [videoId]);

  const fetchUserLocation = async () => {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch("https://ipapi.co/json/", {
        signal: controller.signal,
      }).catch(() => null);
      
      clearTimeout(timeoutId);
      
      if (response && response.ok) {
        const data = await response.json();
        setUserLocation({
          city: data.city || "Unknown",
          country: data.country_name || "Unknown",
        });
      } else {
        // Fallback location
        setUserLocation({ city: "Unknown", country: "Unknown" });
      }
    } catch (error) {
      // Silently handle - location is optional
      setUserLocation({ city: "Unknown", country: "Unknown" });
    }
  };

  const loadComments = async () => {
    try {
      const res = await axiosInstance.get(`/comment/${videoId}`);
      setComments(res.data.filter((c: Comment) => !c.isDeleted));
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    // Check for special characters
    if (hasSpecialCharacters(newComment)) {
      setError("Comments cannot contain special characters like @, #, $, %, etc.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    
    try {
      const res = await axiosInstance.post("/comment/postcomment", {
        videoid: videoId,
        userid: user._id,
        commentbody: newComment,
        usercommented: user.name,
        userCity: userLocation?.city || "Unknown",
        userCountry: userLocation?.country || "Unknown",
        originalLanguage: "auto",
      });
      
      if (res.data.comment) {
        const newCommentObj: Comment = {
          _id: res.data.data?._id || Date.now().toString(),
          videoid: videoId,
          userid: user._id,
          commentbody: newComment,
          usercommented: user.name || "Anonymous",
          commentedon: new Date().toISOString(),
          userCity: userLocation?.city || "Unknown",
          userCountry: userLocation?.country || "Unknown",
          likes: 0,
          dislikes: 0,
          likedBy: [],
          dislikedBy: [],
        };
        setComments([newCommentObj, ...comments]);
        setNewComment("");
      }
    } catch (error: any) {
      if (error.response?.data?.blocked) {
        setError(error.response.data.message);
      } else {
        setError("Failed to post comment. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) return;

    try {
      const res = await axiosInstance.post(`/comment/like/${commentId}`, {
        userId: user._id,
      });

      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? { ...c, likes: res.data.likes, dislikes: res.data.dislikes }
            : c
        )
      );
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleDislikeComment = async (commentId: string) => {
    if (!user) return;

    try {
      const res = await axiosInstance.post(`/comment/dislike/${commentId}`, {
        userId: user._id,
      });

      // If comment was auto-deleted due to dislikes
      if (res.data.deleted) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      } else {
        setComments((prev) =>
          prev.map((c) =>
            c._id === commentId
              ? { ...c, likes: res.data.likes, dislikes: res.data.dislikes }
              : c
          )
        );
      }
    } catch (error) {
      console.error("Error disliking comment:", error);
    }
  };

  const handleTranslate = async (commentId: string, text: string, targetLang: string) => {
    setTranslatingId(commentId);
    
    try {
      const res = await axiosInstance.post("/comment/translate", {
        text,
        targetLang,
      });

      setTranslations((prev) => ({
        ...prev,
        [commentId]: res.data.translatedText,
      }));
    } catch (error) {
      console.error("Error translating:", error);
      // Show original text if translation fails
      setTranslations((prev) => ({
        ...prev,
        [commentId]: text,
      }));
    } finally {
      setTranslatingId(null);
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.commentbody);
  };

  const handleUpdateComment = async () => {
    if (!editText.trim()) return;

    // Check for special characters
    if (hasSpecialCharacters(editText)) {
      setError("Comments cannot contain special characters.");
      return;
    }

    try {
      await axiosInstance.post(`/comment/editcomment/${editingCommentId}`, {
        commentbody: editText,
      });
      
      setComments((prev) =>
        prev.map((c) =>
          c._id === editingCommentId ? { ...c, commentbody: editText } : c
        )
      );
      setEditingCommentId(null);
      setEditText("");
      setError(null);
    } catch (error: any) {
      if (error.response?.data?.blocked) {
        setError(error.response.data.message);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/comment/deletecomment/${id}`);
      setComments((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  if (loading) {
    return <div className="p-4">Loading comments...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{comments.length} Comments</h2>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">×</button>
        </div>
      )}

      {user && (
        <div className="flex gap-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment... (No special characters like @#$% allowed)"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none border-0 border-b-2 rounded-none focus-visible:ring-0"
            />
            {userLocation && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span>Commenting from {userLocation.city}, {userLocation.country}</span>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setNewComment("");
                  setError(null);
                }}
                disabled={!newComment.trim()}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Comment"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <Avatar className="w-10 h-10">
                <AvatarFallback>{comment.usercommented?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-medium text-sm">{comment.usercommented}</span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.commentedon))} ago
                  </span>
                  {comment.userCity && comment.userCity !== "Unknown" && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                      <MapPin className="w-3 h-3" />
                      {comment.userCity}, {comment.userCountry}
                    </span>
                  )}
                </div>

                {editingCommentId === comment._id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button onClick={handleUpdateComment} disabled={!editText.trim()}>
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditText("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm mb-2">
                      {translations[comment._id] || comment.commentbody}
                    </p>
                    
                    {translations[comment._id] && (
                      <p className="text-xs text-gray-500 italic mb-2">
                        Original: {comment.commentbody}
                      </p>
                    )}

                    <div className="flex items-center gap-4 flex-wrap">
                      {/* Like Button */}
                      <button
                        onClick={() => handleLikeComment(comment._id)}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500 transition-colors"
                        disabled={!user}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{comment.likes || 0}</span>
                      </button>

                      {/* Dislike Button */}
                      <button
                        onClick={() => handleDislikeComment(comment._id)}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
                        disabled={!user}
                      >
                        <ThumbsDown className="w-4 h-4" />
                        <span>{comment.dislikes || 0}</span>
                      </button>

                      {/* Translate Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-500 transition-colors">
                            {translatingId === comment._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Languages className="w-4 h-4" />
                            )}
                            <span>Translate</span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="max-h-60 overflow-y-auto">
                          {LANGUAGES.map((lang) => (
                            <DropdownMenuItem
                              key={lang.code}
                              onClick={() =>
                                handleTranslate(comment._id, comment.commentbody, lang.code)
                              }
                            >
                              {lang.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Edit/Delete for own comments */}
                      {user && comment.userid === user._id && (
                        <>
                          <button
                            onClick={() => handleEdit(comment)}
                            className="text-sm text-gray-500 hover:text-blue-500 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(comment._id)}
                            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;
