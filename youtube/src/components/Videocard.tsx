"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useState, useRef } from "react";
import { Play } from "lucide-react";

interface VideoCardProps {
  video: {
    _id: string;
    videotitle?: string;
    videochanel?: string;
    views?: number;
    createdAt?: string;
    filepath?: string;
    thumbnail?: string;
    duration?: string;
  };
}

export default function VideoCard({ video }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoUrl = video?.filepath?.startsWith("http")
    ? video.filepath
    : `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}${video?.filepath}`;

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

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
    <Link href={`/watch/${video?._id}`} className="group block">
      <div className="space-y-3">
        {/* Thumbnail */}
        <div
          className="relative aspect-video rounded-xl overflow-hidden bg-[var(--color-muted)]"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Video element for preview */}
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
              <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
                <Play className="w-6 h-6 text-white fill-white ml-1" />
              </div>
            </div>
          )}
          
          {/* Duration badge */}
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-xs font-medium rounded">
            {video?.duration || "10:24"}
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
        </div>

        {/* Info */}
        <div className="flex gap-3">
          {/* Channel Avatar */}
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white font-medium text-sm">
            {video?.videochanel?.[0]?.toUpperCase() || "C"}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm leading-5 text-[var(--color-foreground)] line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
              {video?.videotitle || "Untitled Video"}
            </h3>
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
              {video?.videochanel || "Unknown Channel"}
            </p>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              {formatViews(video?.views || 0)} views
              <span className="mx-1">•</span>
              {video?.createdAt
                ? formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })
                : "Recently uploaded"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
