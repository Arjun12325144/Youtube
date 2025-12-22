"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Download, Trash2, Crown, Loader2, Play, HardDrive, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface DownloadedVideo {
  _id: string;
  videoId: string;
  videoTitle: string;
  videoPath: string;
  downloadedAt: string;
}

export default function DownloadsPage() {
  const { user } = useUser();
  const [downloads, setDownloads] = useState<DownloadedVideo[]>([]);
  const [userPlan, setUserPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (user) {
      fetchDownloads();
      fetchUserPlan();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDownloads = async () => {
    try {
      const res = await axiosInstance.get(`/download/user/${user?._id}`);
      setDownloads(res.data.downloads || []);
    } catch (error) {
      console.error("Error fetching downloads:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPlan = async () => {
    try {
      const res = await axiosInstance.get(`/payment/user-plan/${user?._id}`);
      setUserPlan(res.data);
    } catch (error) {
      console.error("Error fetching user plan:", error);
    }
  };

  const handleDelete = async (downloadId: string) => {
    if (!confirm("Remove this download?")) return;
    try {
      await axiosInstance.delete(`/download/${downloadId}`);
      setDownloads((prev) => prev.filter((d) => d._id !== downloadId));
    } catch (error) {
      console.error("Error deleting download:", error);
    }
  };

  const handleDownloadAgain = async (download: DownloadedVideo) => {
    setDownloading(download._id);
    try {
      const videoUrl = download.videoPath?.startsWith("http")
        ? download.videoPath
        : `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}${download.videoPath}`;

      const response = await fetch(videoUrl);
      if (!response.ok) throw new Error("Failed to fetch");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${download.videoTitle || "video"}.mp4`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      alert("Failed to download. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  const mainClass = isMobile ? "ml-0" : sidebarOpen ? "ml-60" : "ml-[72px]";

  // Not signed in
  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex pt-14">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={isMobile} />
          <main className={`flex-1 transition-all duration-300 pb-16 lg:pb-0 ${mainClass}`}>
            <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6">
              <div className="p-4 rounded-full bg-[var(--color-secondary)] mb-4">
                <Download className="w-12 h-12 text-[var(--color-muted-foreground)]" />
              </div>
              <h2 className="text-2xl font-semibold text-[var(--color-foreground)] mb-2">Sign in to view downloads</h2>
              <p className="text-[var(--color-muted-foreground)]">Sign in to access your downloaded videos</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex pt-14">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={isMobile} />
        <main className={`flex-1 transition-all duration-300 pb-16 lg:pb-0 ${mainClass}`}>
          <div className="p-3 sm:p-4 lg:p-6 max-w-6xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-green-500/10">
                  <Download className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Downloads</h1>
                  <p className="text-sm text-[var(--color-muted-foreground)]">{downloads.length} videos downloaded</p>
                </div>
              </div>

              {/* Plan Info Card */}
              {userPlan && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)]">
                  <Crown className={`w-6 h-6 ${userPlan.currentPlan === "premium" ? "text-yellow-500" : "text-gray-400"}`} />
                  <div>
                    <p className="font-medium text-[var(--color-foreground)] capitalize">{userPlan.currentPlan} Plan</p>
                    {userPlan.unlimitedDownloads ? (
                      <p className="text-sm text-green-500">Unlimited downloads</p>
                    ) : (
                      <p className="text-sm text-[var(--color-muted-foreground)]">
                        {userPlan.downloadsToday} / {userPlan.dailyDownloadLimit} today
                      </p>
                    )}
                  </div>
                  {!userPlan.unlimitedDownloads && (
                    <Link href="/premium" className="px-3 py-1.5 text-sm bg-[var(--color-primary)] text-white rounded-full hover:bg-red-700 transition-colors">
                      Upgrade
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
              </div>
            )}

            {/* Empty State */}
            {!loading && downloads.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <div className="p-4 rounded-full bg-[var(--color-secondary)] mb-4">
                  <HardDrive className="w-12 h-12 text-[var(--color-muted-foreground)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">No downloads yet</h3>
                <p className="text-[var(--color-muted-foreground)] mb-4">Videos you download will appear here</p>
                <Link href="/" className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-full hover:bg-red-700 transition-colors">
                  Browse videos
                </Link>
              </div>
            )}

            {/* Downloads List */}
            {!loading && downloads.length > 0 && (
              <div className="space-y-3">
                {downloads.map((download) => (
                  <div
                    key={download._id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-muted-foreground)] transition-colors group"
                  >
                    {/* Thumbnail placeholder */}
                    <div className="w-40 h-24 rounded-lg bg-[var(--color-muted)] flex items-center justify-center flex-shrink-0">
                      <Play className="w-8 h-8 text-[var(--color-muted-foreground)]" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/watch/${download.videoId}`}>
                        <h3 className="font-medium text-[var(--color-foreground)] line-clamp-2 hover:text-[var(--color-primary)] transition-colors">
                          {download.videoTitle || "Untitled Video"}
                        </h3>
                      </Link>
                      <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
                        Downloaded {formatDistanceToNow(new Date(download.downloadedAt), { addSuffix: true })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDownloadAgain(download)}
                        disabled={downloading === download._id}
                        className="p-2 rounded-full bg-[var(--color-secondary)] hover:bg-[var(--color-accent)] transition-colors"
                        title="Download again"
                      >
                        {downloading === download._id ? (
                          <Loader2 className="w-5 h-5 animate-spin text-[var(--color-foreground)]" />
                        ) : (
                          <Download className="w-5 h-5 text-[var(--color-foreground)]" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(download._id)}
                        className="p-2 rounded-full bg-[var(--color-secondary)] hover:bg-red-500/20 transition-colors"
                        title="Remove download"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
