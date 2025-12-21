"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, X, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";

// Video thumbnail component with hover to play
function VideoThumbnail({ filepath, title }: { filepath: string; title: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const videoUrl = filepath?.startsWith("http")
    ? filepath
    : `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}${filepath}`;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && !videoError) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => setVideoError(true));
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className="relative w-44 aspect-video bg-[var(--color-muted)] rounded-lg overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover"
        preload="metadata"
        muted
        loop
        playsInline
        onError={() => setVideoError(true)}
      />
      
      {/* Play icon overlay when not hovering */}
      {!isHovered && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>
      )}
      
      {/* Duration badge */}
      <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-xs font-medium rounded">
        {/* You can add actual duration here if available */}
        0:30
      </div>
    </div>
  );
}

export default function HistoryContent() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;

    try {
      const response = await axiosInstance.get(`/history/user/${user._id}`);
      // Filter out history items where the video has been deleted (videoid is null)
      const validHistory = (response.data || []).filter((item: any) => item.videoid !== null);
      setHistory(validHistory);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromHistory = async (historyId: string) => {
    try {
      await axiosInstance.delete(`/history/${historyId}`);
      setHistory(history.filter((item) => item._id !== historyId));
    } catch (error) {
      console.error("Error removing from history:", error);
    }
  };

  // Helper function to safely format date
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "Unknown time";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Unknown time";
      }
      return formatDistanceToNow(date) + " ago";
    } catch (error) {
      return "Unknown time";
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading history...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          Keep track of what you watch
        </h2>
        <p className="text-gray-600">
          Watch history isn't viewable when signed out.
        </p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No watch history yet</h2>
        <p className="text-gray-600">Videos you watch will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-[var(--color-muted-foreground)]">{history.length} videos</p>
      </div>

      <div className="space-y-4">
        {history.map((item) => {
          // Skip items with missing video data
          if (!item.videoid) {
            return null;
          }

          return (
            <div key={item._id} className="flex gap-4 group">
              <Link href={`/watch/${item.videoid._id}`} className="flex-shrink-0">
                {item.videoid.filepath ? (
                  <VideoThumbnail 
                    filepath={item.videoid.filepath} 
                    title={item.videoid.videotitle || "Video"} 
                  />
                ) : (
                  <div className="w-44 aspect-video bg-[var(--color-muted)] rounded-lg flex items-center justify-center text-[var(--color-muted-foreground)]">
                    No video
                  </div>
                )}
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/watch/${item.videoid._id}`}>
                  <h3 className="font-medium text-sm line-clamp-2 text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] transition-colors mb-1">
                    {item.videoid.videotitle || "Untitled Video"}
                  </h3>
                </Link>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  {item.videoid.videochanel || "Unknown Channel"}
                </p>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  {item.videoid.views?.toLocaleString() || "0"} views •{" "}
                  {formatDate(item.videoid.createdAt)}
                </p>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                  Watched {formatDate(item.createdAt)}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleRemoveFromHistory(item._id)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove from watch history
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>
    </div>
  );
}