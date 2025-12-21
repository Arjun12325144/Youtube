"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Monitor,
  Users,
  Circle,
  Square,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "./ui/button";
import { getSocket } from "@/lib/socket";

interface VideoCallProps {
  roomId: string;
  userId: string;
  userName: string;
}

const VideoCall: React.FC<VideoCallProps> = ({ roomId, userId, userName }) => {
  // Video refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // State
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "connected" | "ended">("idle");
  const [participants, setParticipants] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);

  // WebRTC refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // ICE Servers
  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
    ],
  };

  // Initialize local media
  const initMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true,
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err: any) {
      console.error("Error accessing media:", err);
      setError("Could not access camera/microphone. Please check permissions.");
      return null;
    }
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback((stream: MediaStream) => {
    const socket = getSocket();
    const pc = new RTCPeerConnection(iceServers);

    // Add local tracks
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // Handle remote tracks
    pc.ontrack = (event) => {
      console.log("Received remote track");
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("ice-candidate", {
          candidate: event.candidate,
          roomId,
        });
      }
    };

    // Connection state change
    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
      if (pc.connectionState === "connected") {
        setCallStatus("connected");
      } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        setCallStatus("ended");
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [roomId]);

  // Start call
  const startCall = async () => {
    setCallStatus("connecting");
    setError(null);

    const stream = await initMedia();
    if (!stream) {
      setCallStatus("idle");
      return;
    }

    const socket = getSocket();
    if (!socket) {
      setError("Socket not connected");
      setCallStatus("idle");
      return;
    }

    const pc = createPeerConnection(stream);

    // Join room
    socket.emit("join-video-room", { roomId, userName, oderId: userId });

    // Create offer
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      socket.emit("video-offer", {
        offer,
        roomId,
        userName,
      });
    } catch (err) {
      console.error("Error creating offer:", err);
      setError("Failed to start call");
      setCallStatus("idle");
    }
  };

  // Answer incoming call
  const handleOffer = useCallback(async (data: { offer: RTCSessionDescriptionInit; userName: string }) => {
    console.log("Received offer from:", data.userName);
    
    if (!localStream) {
      const stream = await initMedia();
      if (!stream) return;
    }

    const pc = peerConnectionRef.current || createPeerConnection(localStream!);
    
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const socket = getSocket();
      socket?.emit("video-answer", {
        answer,
        roomId,
      });

      setCallStatus("connected");
    } catch (err) {
      console.error("Error handling offer:", err);
    }
  }, [localStream, createPeerConnection, initMedia, roomId]);

  // Handle answer
  const handleAnswer = useCallback(async (data: { answer: RTCSessionDescriptionInit }) => {
    console.log("Received answer");
    try {
      await peerConnectionRef.current?.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );
    } catch (err) {
      console.error("Error handling answer:", err);
    }
  }, []);

  // Handle ICE candidate
  const handleIceCandidate = useCallback(async (data: { candidate: RTCIceCandidateInit }) => {
    try {
      await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (err) {
      console.error("Error adding ICE candidate:", err);
    }
  }, []);

  // End call
  const endCall = () => {
    // Stop all tracks
    localStream?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());

    // Close peer connection
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    // Stop recording
    if (isRecording) {
      stopRecording();
    }

    // Reset state
    setLocalStream(null);
    setRemoteStream(null);
    setCallStatus("ended");
    setIsScreenSharing(false);

    // Notify others
    const socket = getSocket();
    socket?.emit("leave-video-room", { roomId });
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // Screen share
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen share
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
      setIsScreenSharing(false);

      // Restore camera
      if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current?.getSenders().find((s) => s.track?.kind === "video");
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
      }
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        setIsScreenSharing(true);

        // Replace video track
        const screenTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current?.getSenders().find((s) => s.track?.kind === "video");
        if (sender && screenTrack) {
          sender.replaceTrack(screenTrack);
        }

        // Handle screen share end
        screenTrack.onended = () => {
          setIsScreenSharing(false);
          if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (sender && videoTrack) {
              sender.replaceTrack(videoTrack);
            }
          }
        };
      } catch (err) {
        console.error("Screen share error:", err);
      }
    }
  };

  // Recording
  const startRecording = () => {
    if (!localStream) return;

    const chunks: Blob[] = [];
    const mediaRecorder = new MediaRecorder(localStream, {
      mimeType: "video/webm;codecs=vp9",
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      setRecordedChunks(chunks);
    };

    mediaRecorder.start(1000);
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
    setRecordingTime(0);

    recordingTimerRef.current = setInterval(() => {
      setRecordingTime((t) => t + 1);
    }, 1000);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setIsRecording(false);

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const downloadRecording = () => {
    if (recordedChunks.length === 0) return;

    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recording-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Setup socket listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("video-offer", handleOffer);
    socket.on("video-answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("user-joined-video", (data: { userName: string }) => {
      setParticipants((prev) => [...prev, data.userName]);
    });
    socket.on("user-left-video", (data: { userName: string }) => {
      setParticipants((prev) => prev.filter((p) => p !== data.userName));
    });

    return () => {
      socket.off("video-offer", handleOffer);
      socket.off("video-answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("user-joined-video");
      socket.off("user-left-video");
    };
  }, [handleOffer, handleAnswer, handleIceCandidate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  return (
    <div 
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5" style={{ color: "var(--primary)" }} />
          <span className="font-semibold" style={{ color: "var(--foreground)" }}>
            Video Call
          </span>
          {callStatus === "connected" && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-green-500 text-white">
              Connected
            </span>
          )}
        </div>
        {participants.length > 0 && (
          <div className="flex items-center gap-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
            <Users className="w-4 h-4" />
            <span>{participants.length + 1}</span>
          </div>
        )}
      </div>

      {/* Video Area */}
      <div className="relative bg-black aspect-video">
        {/* Remote Video (Main) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Local Video (PIP) */}
        <div className="absolute bottom-4 right-4 w-32 h-24 rounded-lg overflow-hidden border-2 border-white shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <VideoOff className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        {/* Status Overlay */}
        {callStatus === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80">
            <Video className="w-16 h-16 text-white mb-4" />
            <p className="text-white mb-4">Start a video call</p>
            <Button onClick={startCall} className="gap-2" style={{ backgroundColor: "var(--primary)" }}>
              <Phone className="w-4 h-4" />
              Start Call
            </Button>
          </div>
        )}

        {callStatus === "connecting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80">
            <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
            <p className="text-white">Connecting...</p>
          </div>
        )}

        {callStatus === "ended" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80">
            <PhoneOff className="w-16 h-16 text-red-500 mb-4" />
            <p className="text-white mb-4">Call ended</p>
            <Button onClick={startCall} variant="outline" className="gap-2">
              <Phone className="w-4 h-4" />
              Call Again
            </Button>
          </div>
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-red-600 rounded-full">
            <Circle className="w-3 h-3 fill-white text-white animate-pulse" />
            <span className="text-white text-sm font-medium">{formatTime(recordingTime)}</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Controls */}
      <div 
        className="flex items-center justify-center gap-3 px-4 py-4"
        style={{ backgroundColor: "var(--card)" }}
      >
        {/* Video Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleVideo}
          disabled={callStatus !== "connected"}
          className="rounded-full w-12 h-12"
          style={{
            backgroundColor: isVideoEnabled ? "var(--muted)" : "#ef4444",
            color: isVideoEnabled ? "var(--foreground)" : "white",
          }}
        >
          {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </Button>

        {/* Audio Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleAudio}
          disabled={callStatus !== "connected"}
          className="rounded-full w-12 h-12"
          style={{
            backgroundColor: isAudioEnabled ? "var(--muted)" : "#ef4444",
            color: isAudioEnabled ? "var(--foreground)" : "white",
          }}
        >
          {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </Button>

        {/* Screen Share */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleScreenShare}
          disabled={callStatus !== "connected"}
          className="rounded-full w-12 h-12"
          style={{
            backgroundColor: isScreenSharing ? "var(--primary)" : "var(--muted)",
            color: isScreenSharing ? "white" : "var(--foreground)",
          }}
        >
          <Monitor className="w-5 h-5" />
        </Button>

        {/* Record Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={callStatus !== "connected"}
          className="rounded-full w-12 h-12"
          style={{
            backgroundColor: isRecording ? "#ef4444" : "var(--muted)",
            color: isRecording ? "white" : "var(--foreground)",
          }}
        >
          {isRecording ? <Square className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
        </Button>

        {/* End Call */}
        <Button
          variant="ghost"
          size="icon"
          onClick={endCall}
          disabled={callStatus === "idle"}
          className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700 text-white"
        >
          <PhoneOff className="w-5 h-5" />
        </Button>

        {/* Download Recording */}
        {recordedChunks.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={downloadRecording}
            className="rounded-full w-12 h-12"
            style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
          >
            <Download className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
