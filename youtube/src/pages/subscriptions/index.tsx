"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import Link from "next/link";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Loader2, PlaySquare, Users, Bell, BellOff } from "lucide-react";

export default function SubscriptionsPage() {
  const { user } = useUser();
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/subscribe/user/${user._id}`);
        setSubs(res.data || []);
      } catch (err) {
        console.error("Failed to load subscriptions:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleUnsubscribe = async (channelId: string, subId: string) => {
    if (!user) return;
    try {
      await axiosInstance.post(`/subscribe/${channelId}`, { subscriber: user._id });
      setSubs((s) => s.filter((item) => item._id !== subId));
    } catch (err) {
      console.error("Failed to unsubscribe:", err);
    }
  };

  // Not signed in
  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex pt-14">
          <Sidebar isOpen={sidebarOpen} />
          <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-60" : "ml-[72px]"}`}>
            <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6">
              <div className="p-4 rounded-full bg-[var(--color-secondary)] mb-4">
                <Users className="w-12 h-12 text-[var(--color-muted-foreground)]" />
              </div>
              <h2 className="text-2xl font-semibold text-[var(--color-foreground)] mb-2">
                Don't miss new videos
              </h2>
              <p className="text-[var(--color-muted-foreground)] max-w-md">
                Sign in to see updates from your favorite channels
              </p>
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
        <Sidebar isOpen={sidebarOpen} />
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-60" : "ml-[72px]"}`}>
          <div className="p-6 max-w-6xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-full bg-[var(--color-primary)]/10">
                <PlaySquare className="w-6 h-6 text-[var(--color-primary)]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Subscriptions</h1>
                <p className="text-sm text-[var(--color-muted-foreground)]">{subs.length} channels</p>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
              </div>
            )}

            {/* Empty State */}
            {!loading && subs.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <div className="p-4 rounded-full bg-[var(--color-secondary)] mb-4">
                  <Users className="w-12 h-12 text-[var(--color-muted-foreground)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">No subscriptions yet</h3>
                <p className="text-[var(--color-muted-foreground)] mb-4">Subscribe to channels to see their videos here</p>
                <Link href="/explore" className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-full hover:bg-red-700 transition-colors">
                  Explore channels
                </Link>
              </div>
            )}

            {/* Subscriptions Grid */}
            {!loading && subs.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {subs.map((sub) => (
                  <div
                    key={sub._id}
                    className="p-4 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-muted-foreground)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {sub.channel?.channelname?.[0]?.toUpperCase() || "C"}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/channel/${sub.channel?._id}`}>
                          <h3 className="font-medium text-[var(--color-foreground)] truncate hover:text-[var(--color-primary)] transition-colors">
                            {sub.channel?.channelname || "Unknown Channel"}
                          </h3>
                        </Link>
                        <p className="text-sm text-[var(--color-muted-foreground)]">
                          {sub.channel?.subscribers || 0} subscribers
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => handleUnsubscribe(sub.channel?._id, sub._id)}
                        className="flex-1 px-3 py-2 text-sm font-medium rounded-full bg-[var(--color-secondary)] text-[var(--color-foreground)] hover:bg-[var(--color-accent)] transition-colors"
                      >
                        Subscribed
                      </button>
                      <button className="p-2 rounded-full bg-[var(--color-secondary)] hover:bg-[var(--color-accent)] transition-colors">
                        <Bell className="w-4 h-4 text-[var(--color-foreground)]" />
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
