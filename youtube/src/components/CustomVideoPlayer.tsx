"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipForward,
  SkipBack,
} from "lucide-react";
import { useRouter } from "next/router";

interface CustomVideoPlayerProps {
  src: string;
  poster?: string;
  onShowComments?: () => void;
  onNextVideo?: () => void;
  autoPlay?: boolean;
}

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
  src,
  poster,
  onShowComments,
  onNextVideo,
  autoPlay = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [tapFeedback, setTapFeedback] = useState<{
    type: string;
    position: "left" | "center" | "right";
  } | null>(null);

  // Tap detection
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapTimeRef = useRef(0);
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Format time helper
  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Show tap feedback animation
  const showTapFeedback = (type: string, position: "left" | "center" | "right") => {
    setTapFeedback({ type, position });
    setTimeout(() => setTapFeedback(null), 500);
  };

  // Handle tap gestures
  const handleTap = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const video = videoRef.current;
      const container = containerRef.current;
      if (!video || !container) return;

      // Determine tap position (left, center, right)
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const position: "left" | "center" | "right" =
        x < width / 3 ? "left" : x > (2 * width) / 3 ? "right" : "center";

      const now = Date.now();
      const timeSinceLastTap = now - lastTapTimeRef.current;
      lastTapTimeRef.current = now;

      if (timeSinceLastTap < 300) {
        tapCountRef.current++;
      } else {
        tapCountRef.current = 1;
      }

      // Clear existing timer
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }

      // Set timer to process taps
      tapTimerRef.current = setTimeout(() => {
        const tapCount = tapCountRef.current;

        if (tapCount === 1) {
          // Single tap - pause/play (center only)
          if (position === "center") {
            if (video.paused) {
              video.play();
              setIsPlaying(true);
              showTapFeedback("play", position);
            } else {
              video.pause();
              setIsPlaying(false);
              showTapFeedback("pause", position);
            }
          }
        } else if (tapCount === 2) {
          // Double tap
          if (position === "left") {
            // Rewind 10 seconds
            video.currentTime = Math.max(0, video.currentTime - 10);
            showTapFeedback("-10s", position);
          } else if (position === "right") {
            // Forward 10 seconds
            video.currentTime = Math.min(video.duration, video.currentTime + 10);
            showTapFeedback("+10s", position);
          } else {
            // Double tap center - toggle fullscreen
            toggleFullscreen();
          }
        } else if (tapCount >= 3) {
          // Triple tap
          if (position === "center") {
            // Go to next video
            if (onNextVideo) {
              showTapFeedback("Next Video", position);
              setTimeout(() => onNextVideo(), 300);
            }
          } else if (position === "right") {
            // Close website / go to home
            showTapFeedback("Closing...", position);
            setTimeout(() => {
              router.push("/");
            }, 300);
          } else if (position === "left") {
            // Show comments
            if (onShowComments) {
              showTapFeedback("Comments", position);
              onShowComments();
            }
          }
        }

        tapCountRef.current = 0;
      }, 300);
    },
    [onNextVideo, onShowComments, router]
  );

  // Play/Pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Mute/Unmute
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  // Volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  // Fullscreen
  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Seek
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressBar = progressRef.current;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
  };

  // Playback rate
  const handlePlaybackRateChange = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  // Skip forward/backward with keyboard
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const video = videoRef.current;
    if (!video) return;

    switch (e.key) {
      case " ":
      case "k":
        e.preventDefault();
        togglePlay();
        break;
      case "ArrowRight":
        video.currentTime = Math.min(video.duration, video.currentTime + 10);
        break;
      case "ArrowLeft":
        video.currentTime = Math.max(0, video.currentTime - 10);
        break;
      case "ArrowUp":
        e.preventDefault();
        video.volume = Math.min(1, video.volume + 0.1);
        setVolume(video.volume);
        break;
      case "ArrowDown":
        e.preventDefault();
        video.volume = Math.max(0, video.volume - 0.1);
        setVolume(video.volume);
        break;
      case "f":
        toggleFullscreen();
        break;
      case "m":
        toggleMute();
        break;
    }
  }, []);

  // Event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (onNextVideo) {
        onNextVideo();
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, onNextVideo]);

  // Auto-hide controls
  useEffect(() => {
    const hideControls = () => {
      if (isPlaying) {
        setShowControls(false);
      }
    };

    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }

    if (showControls && isPlaying) {
      controlsTimerRef.current = setTimeout(hideControls, 3000);
    }

    return () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, [showControls, isPlaying]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        autoPlay={autoPlay}
      />

      {/* Click overlay for gesture detection */}
      <div
        className="absolute inset-0"
        onClick={handleTap}
      />

      {/* Tap Feedback Overlay */}
      {tapFeedback && (
        <div
          className={`absolute top-1/2 -translate-y-1/2 transform transition-all duration-300 
            ${tapFeedback.position === "left" ? "left-1/4" : ""}
            ${tapFeedback.position === "center" ? "left-1/2 -translate-x-1/2" : ""}
            ${tapFeedback.position === "right" ? "right-1/4" : ""}
            bg-black/70 text-white px-4 py-2 rounded-full text-lg font-medium animate-pulse
          `}
        >
          {tapFeedback.type === "play" && <Play className="w-8 h-8" />}
          {tapFeedback.type === "pause" && <Pause className="w-8 h-8" />}
          {tapFeedback.type !== "play" && tapFeedback.type !== "pause" && tapFeedback.type}
        </div>
      )}

      {/* Double-tap zones visual hint (shown on hover) */}
      <div className="absolute inset-0 flex opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300">
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white/10 rounded-full p-3">
            <SkipBack className="w-6 h-6 text-white/50" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          {!isPlaying ? (
            <div className="bg-white/10 rounded-full p-4">
              <Play className="w-8 h-8 text-white/50" />
            </div>
          ) : (
            <div className="bg-white/10 rounded-full p-4">
              <Pause className="w-8 h-8 text-white/50" />
            </div>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white/10 rounded-full p-3">
            <SkipForward className="w-6 h-6 text-white/50" />
          </div>
        </div>
      </div>

      {/* Controls Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Progress Bar */}
        <div
          ref={progressRef}
          className="relative h-1 bg-white/30 rounded-full cursor-pointer mb-3 group/progress"
          onClick={handleSeek}
        >
          {/* Buffered */}
          <div
            className="absolute h-full bg-white/50 rounded-full"
            style={{ width: `${(buffered / duration) * 100}%` }}
          />
          {/* Progress */}
          <div
            className="absolute h-full bg-red-500 rounded-full"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          {/* Thumb */}
          <div
            className="absolute w-3 h-3 bg-red-500 rounded-full -top-1 -translate-x-1/2 opacity-0 group-hover/progress:opacity-100 transition-opacity"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-red-500 transition-colors"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            {/* Skip Buttons */}
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime -= 10;
                }
              }}
              className="text-white hover:text-red-500 transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime += 10;
                }
              }}
              className="text-white hover:text-red-500 transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={toggleMute}
                className="text-white hover:text-red-500 transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/volume:w-20 transition-all duration-300 accent-red-500"
              />
            </div>

            {/* Time */}
            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Settings (Playback Speed) */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-white hover:text-red-500 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              {showSettings && (
                <div className="absolute bottom-8 right-0 bg-black/90 rounded-lg py-2 min-w-[120px]">
                  <p className="text-white/50 text-xs px-3 pb-1">Speed</p>
                  {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handlePlaybackRateChange(rate)}
                      className={`w-full text-left px-3 py-1 text-sm hover:bg-white/20 ${
                        playbackRate === rate ? "text-red-500" : "text-white"
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-red-500 transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Gesture Instructions (shown briefly on first interaction) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Double-tap sides to skip • Triple-tap center for next video
      </div>
    </div>
  );
};

export default CustomVideoPlayer;
