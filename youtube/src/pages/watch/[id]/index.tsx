"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Comments from "@/components/Comments";
import RelatedVideos from "@/components/RelatedVideos";
import VideoInfo from "@/components/VideoInfo";
import CustomVideoPlayer from "@/components/CustomVideoPlayer";
import VideoCall from "@/components/VideoCall";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import { getVideoUrl, getThumbnailUrl } from "@/lib/utils";
import { isSocketAvailable } from "@/lib/socket";
import { Download, Loader2, Video as VideoIcon, Phone, PhoneOff, AlertCircle, CheckCircle } from "lucide-react";

export default function WatchPage() {
  const router = useRouter();
  const { id } = router.query;
  const videoId = Array.isArray(id) ? id[0] : id;
  const { user } = useUser();

  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [canUseVideoCall, setCanUseVideoCall] = useState(false);
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    // Check if video call is available
    setCanUseVideoCall(isSocketAvailable());
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!videoId) return;
    const fetchVideo = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/video/getall");
        const all = Array.isArray(res.data) ? res.data : [];
        setSelectedVideo(all.find((v: any) => v._id === videoId) || null);
        setRelatedVideos(all.filter((v: any) => v._id !== videoId));
      } catch (error) {
        console.error("Failed to fetch video:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [videoId]);

  const handleDownload = async () => {
    if (!user) return alert("Please sign in to download videos");
    if (!selectedVideo) return;
    setDownloading(true);
    setDownloadError(null);
    setDownloadSuccess(false);
    try {
      const canRes = await axiosInstance.get(`/download/can-download/${user._id}`);
      if (!canRes.data.canDownload) {
        setDownloadError(canRes.data.message || "Download limit reached!");
        return;
      }
      const videoSrc = getVideoUrl(selectedVideo);
      const response = await fetch(videoSrc);
      if (!response.ok) throw new Error("Failed to fetch video");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedVideo.videotitle || "video"}.mp4`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
      
      try {
        await axiosInstance.post("/download/record", {
          userId: user._id,
          videoId: selectedVideo._id,
          videoTitle: selectedVideo.videotitle,
          videoPath: selectedVideo.filepath,
        });
      } catch (recordError) {
        console.error("Failed to record download:", recordError);
      }
      
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (error: any) {
      setDownloadError(error.response?.data?.message || "Failed to download video");
    } finally {
      setDownloading(false);
    }
  };

  const mainClass = isMobile ? "ml-0" : sidebarOpen ? "ml-60" : "ml-[72px]";

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex pt-14">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={isMobile} />
          <main className={`flex-1 transition-all duration-300 ${mainClass}`}>
            <div className="flex items-center justify-center h-[80vh]">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
              <span className="ml-3 text-[var(--color-foreground)]">Loading video...</span>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!selectedVideo) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex pt-14">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={isMobile} />
          <main className={`flex-1 transition-all duration-300 ${mainClass}`}>
            <div className="flex flex-col items-center justify-center h-[80vh] px-4">
              <VideoIcon className="w-16 h-16 sm:w-20 sm:h-20 mb-4 text-[var(--color-muted-foreground)]" />
              <h2 className="text-xl sm:text-2xl font-semibold text-[var(--color-foreground)] mb-2 text-center">Video not found</h2>
              <p className="text-[var(--color-muted-foreground)] mb-6 text-center">The video you're looking for doesn't exist.</p>
              <button onClick={() => router.push("/")} className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-full hover:bg-red-700 transition-colors">Go Home</button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const videoUrl = getVideoUrl(selectedVideo);
  const thumbnailUrl = getThumbnailUrl(selectedVideo);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex pt-14">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={isMobile} />
        <main className={`flex-1 transition-all duration-300 pb-16 lg:pb-0 ${mainClass}`}>
          <div className="max-w-[1800px] mx-auto p-2 sm:p-4 lg:p-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
              <div className="xl:col-span-2 space-y-3 sm:space-y-4">
                {/* Video Player - Full width on mobile */}
                <div className="rounded-none sm:rounded-xl overflow-hidden bg-black aspect-video -mx-2 sm:mx-0">
                  <CustomVideoPlayer
                    src={videoUrl}
                    poster={thumbnailUrl}
                    onNextVideo={() => relatedVideos.length > 0 && router.push(`/watch/${relatedVideos[0]._id}`)}
                    onShowComments={() => commentsRef.current?.scrollIntoView({ behavior: "smooth" })}
                  />
                </div>
                
                {/* Video Title & Actions */}
                <div className="space-y-3 px-1 sm:px-0">
                  <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-[var(--color-foreground)] line-clamp-2">
                    {selectedVideo.videotitle || "Untitled Video"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={handleDownload} disabled={downloading}
                      className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${downloading ? "bg-[var(--color-muted)] text-[var(--color-muted-foreground)] cursor-not-allowed" : "bg-[var(--color-secondary)] text-[var(--color-foreground)] hover:bg-[var(--color-accent)]"}`}>
                      {downloading ? <><Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /><span className="hidden sm:inline">Downloading...</span><span className="sm:hidden">...</span></> : <><Download className="w-3 h-3 sm:w-4 sm:h-4" /><span>Download</span></>}
                    </button>
                    {canUseVideoCall && (
                      <button onClick={() => setShowVideoCall(!showVideoCall)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${showVideoCall ? "bg-red-500 text-white hover:bg-red-600" : "bg-[var(--color-secondary)] text-[var(--color-foreground)] hover:bg-[var(--color-accent)]"}`}>
                        {showVideoCall ? <><PhoneOff className="w-3 h-3 sm:w-4 sm:h-4" /><span className="hidden sm:inline">End Call</span></> : <><Phone className="w-3 h-3 sm:w-4 sm:h-4" /><span className="hidden sm:inline">Video Call</span><span className="sm:hidden">Call</span></>}
                      </button>
                    )}
                    {downloadError && <span className="flex items-center gap-1 text-xs sm:text-sm text-red-500"><AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" /><span className="line-clamp-1">{downloadError}</span></span>}
                    {downloadSuccess && <span className="flex items-center gap-1 text-xs sm:text-sm text-green-500"><CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />Downloaded!</span>}
                  </div>
                </div>
                
                {showVideoCall && user && canUseVideoCall && (
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-3 sm:p-4">
                    <VideoCall roomId={videoId || "default-room"} userId={user._id} userName={user.name || "Anonymous"} />
                  </div>
                )}
                
                <VideoInfo video={selectedVideo} />
                <div ref={commentsRef}>{videoId && <Comments videoId={videoId} />}</div>
              </div>
              
              {/* Related Videos */}
              <div className="xl:col-span-1 mt-4 xl:mt-0">
                <h3 className="font-medium text-[var(--color-foreground)] mb-3 sm:mb-4 px-1 sm:px-0">Related Videos</h3>
                <RelatedVideos videos={relatedVideos} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}