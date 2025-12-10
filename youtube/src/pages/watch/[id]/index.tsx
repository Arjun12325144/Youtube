// // import Comments from "@/components/Comments";
// // import RelatedVideos from "@/components/RelatedVideos";
// import VideoInfo from "@/components/VideoInfo";
// import Videoplayer from "@/components/Videoplayer";
// import Comments from "@/components/Comments"
// import RelatedVideos from "@/components/RelatedVideos";
// // import axiosInstance from "@/lib/axiosinstance";
// import { notFound } from "next/navigation";
// import { useRouter } from "next/router";
// import React, { useEffect, useMemo, useState } from "react";
// const index= ()=>{
//     const router = useRouter();
//     const {id}  = router.query
//     const relatedVideos = [
//         {
//             _id:"1",
//             videotitle:"Amazing Nature Documentry",
//             filename:'vdo.mp4',
//             filetype:'video/mp4',
//             filepath:"/video/vdo.mp4",
//             filesize: "500MB",
//             videochannel : "Nature channel",
//             Like:1250,
//             Dislike:22,
//             views:45000,
//             uploader:"nature_lover",
//             createdAt:new Date().toISOString(),
    
//         },
//         {
//             _id:"2",
//             videotitle:"Amazing Nature Documentry",
//             filename:'vdo.mp4',
//             filetype:'video/mp4',
//             filepath:"/video/vdo.mp4",
//             filesize: "500MB",
//             videochannel : "Nature channel",
//             Like:1250,
//             Dislike:29,
//             views:45000,
//             uploader:"nature_lover",
//             createdAt:new Date().toISOString(),
    
//         },
//     ]
//     const video = useMemo(()=>{
//         const Stringid = Array.isArray(id)? id[0]:id;
//         return relatedVideos.find((video)=> video._id === Stringid  );
//     },[id])
//     if(!video){
//         return <div>Video not found</div>
//     }
//     return (
//         <div className='min-h-screen bg-white'>
//             <div className='max-w-7xl mx-auto p-4  '>
//                 <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
//                     <div className='lg:col-span-2 space-y-4'>
//                         <Videoplayer video={video}/>
//                         <VideoInfo video={video}/>
//                         <Comments videoId = {id}/>

//                     </div>
//                     <div className='space-y-4'>
//                         <RelatedVideos videos={relatedVideos} />
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default index;
import Comments from "@/components/Comments";
import RelatedVideos from "@/components/RelatedVideos";
import VideoInfo from "@/components/VideoInfo";
import Videoplayer from "@/components/Videoplayer";
import axiosInstance from "@/lib/axiosinstance";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const index = () => {
  const router = useRouter();
  const { id } = router.query;
  const videoId = Array.isArray(id) ? id[0] : id;
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!videoId) return;
    let mounted = true;
    const fetchVideo = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/video/getall");
        const all = Array.isArray(res.data) ? res.data : [];
        const found = all.find((v: any) => v._id === videoId) || null;
        const related = all.filter((v: any) => v._id !== videoId);
        if (!mounted) return;
        setSelectedVideo(found);
        setRelatedVideos(related);
      } catch (error) {
        console.error("Failed to fetch video list:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchVideo();
    return () => {
      mounted = false;
    };
  }, [videoId]);
  // const relatedVideos = [
  //   {
  //     _id: "1",
  //     videotitle: "Amazing Nature Documentary",
  //     filename: "nature-doc.mp4",
  //     filetype: "video/mp4",
  //     filepath: "/videos/nature-doc.mp4",
  //     filesize: "500MB",
  //     videochanel: "Nature Channel",
  //     Like: 1250,
  //     Dislike: 50,
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
  //     Dislike: 20,
  //     views: 23000,
  //     uploader: "chef_master",
  //     createdAt: new Date(Date.now() - 86400000).toISOString(),
  //   },
  // ];
  if (loading) return <div>Loading..</div>;
  if (!selectedVideo) return <div>Video not found</div>;
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Videoplayer video={selectedVideo} />
            <VideoInfo video={selectedVideo} />
            <Comments videoId={videoId} />
          </div>
          <div className="space-y-4">
            <RelatedVideos videos={relatedVideos} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;