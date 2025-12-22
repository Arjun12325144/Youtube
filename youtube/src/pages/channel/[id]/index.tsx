
import ChannelHeader from "@/components/ChannelHeader";
import Channeltabs from "@/components/Channeltabs";
import ChannelVideos from "@/components/ChannelVideos";
import VideoUploader from "@/components/VideoUploader";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";

const ChannelPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const channelId = Array.isArray(id) ? id[0] : id;
  const { user } = useUser();
  const [channelData, setChannelData] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!router.isReady) return;

    const fetchChannelAndVideos = async () => {
      setIsLoading(true);
      try {
        // fast local fallback: if currently logged in user matches channelId, use it
        if (user && user._id && channelId && user._id === channelId) {
          if (mounted) setChannelData(user);
        } else if (channelId) {
          console.log("Fetching user with id:", channelId);
          const res = await axiosInstance.get(`/user/${channelId}`);
          console.log("User fetch response:", res.data);
          if (mounted) setChannelData(res.data);
        }
      } catch (err: any) {
        console.error("Failed to fetch channel user:", err?.response?.status, err?.response?.data || err?.message);
      }

      try {
        if (!channelId) return;
        // Try a dedicated endpoint first, fallback to getall with query
        let vidsRes;
        try {
          vidsRes = await axiosInstance.get(`/video/by-uploader/${channelId}`);
        } catch (e) {
          vidsRes = await axiosInstance.get(`/video/getall?uploader=${channelId}`);
        }
        if (mounted && vidsRes?.data) setVideos(vidsRes.data);
      } catch (err) {
        console.error("Failed to fetch channel videos:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchChannelAndVideos();
    return () => {
      mounted = false;
    };
  }, [router.isReady, id, user]);

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-[var(--color-foreground)]">Loading...</div>
      </div>
    );
  }

  if (!channelData) {
    return (
      <div className="flex-1 min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-[var(--color-foreground)]">Channel not found</div>
      </div>
    );
  }

  const mainClass = `flex-1 transition-all duration-300 pt-14 pb-16 lg:pb-0 ${!isMobile ? (sidebarOpen ? "ml-60" : "ml-[72px]") : "ml-0"}`;

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={isMobile} />
      
      <main className={mainClass}>
        <div className="max-w-full mx-auto">
          <ChannelHeader channel={channelData} user={user} />
          <Channeltabs />
          <div className="px-2 sm:px-4 pb-8">
            <VideoUploader channelId={id} channelName={channelData?.channelname} />
          </div>
          <div className="px-2 sm:px-4 pb-8">
            <ChannelVideos videos={videos} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChannelPage;