"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function SubscriptionsPage() {
  const { user } = useUser();
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/subscribe/user/${user._id}`);
        if (mounted) setSubs(res.data || []);
      } catch (err) {
        console.error("Failed to load subscriptions:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
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

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-lg">Sign in to see your subscriptions.</p>
      </div>
    );
  }

  if (loading) return <div className="p-6">Loading subscriptions...</div>;

  if (!subs || subs.length === 0)
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold">No subscriptions yet</h2>
        <p className="text-gray-600">Subscribe to channels to see them here.</p>
      </div>
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Subscriptions</h1>
      <div className="space-y-4">
        {subs.map((s) => (
          <div key={s._id} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback>{s.channel?.channelname?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <Link href={`/channel/${s.channel?._id}`}>
                  <div className="font-medium">{s.channel?.channelname}</div>
                </Link>
                <div className="text-sm text-gray-600">{s.channel?.description}</div>
              </div>
            </div>

            <div>
              <Button
                variant="ghost"
                onClick={() => handleUnsubscribe(s.channel?._id, s._id)}
              >
                Unsubscribe
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
