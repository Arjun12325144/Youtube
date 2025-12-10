
import ChannelHeader from "@/components/ChannelHeader";
import Channeltabs from "@/components/Channeltabs";
import ChannelVideos from "@/components/ChannelVideos";
import VideoUploader from "@/components/VideoUploader";
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
      <div className="flex-1 min-h-screen bg-white flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!channelData) {
    return (
      <div className="flex-1 min-h-screen bg-white flex items-center justify-center">
        <div>Channel not found</div>
      </div>
    );
  }

  // const videos = [
  //   {
  //     _id: "1",
  //     videotitle: "Amazing Nature Documentary",
  //     filename: "nature-doc.mp4",
  //     filetype: "video/mp4",
  //     filepath: "/videos/nature-doc.mp4",
  //     filesize: "500MB",
  //     videochanel: "Nature Channel",
  //     Like: 1250,
  //     views: 45000,
  //     uploader: "nature_lover",
  //     createdAt: new Date().toISOString(),
  //   },
  //   {
  //     _id: "2",
  //     videotitle: "Cooking Tutorial: Perfect Pasta",
  //     filename: "pasta-tutorial.mp4",
  //     filetype: "video/mp4",
  //     filepath: "/videos/pasta-tutorial.mp4",
  //     filesize: "300MB",
  //     videochanel: "Chef's Kitchen",
  //     Like: 890,
  //     views: 23000,
  //     uploader: "chef_master",
  //     createdAt: new Date(Date.now() - 86400000).toISOString(),
  //   },
  // ];

  return (
    <div className="flex-1 min-h-screen bg-white">
      <div className="max-w-full mx-auto">
        <ChannelHeader channel={channelData} user={user} />
        <Channeltabs />
        <div className="px-4 pb-8">
          <VideoUploader channelId={id} channelName={channelData?.channelname} />
        </div>
        <div className="px-4 pb-8">
          <ChannelVideos videos={videos} />
        </div>
      </div>
    </div>
  );
};

export default ChannelPage;