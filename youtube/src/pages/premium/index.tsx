"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Check, Crown, Zap, Download, Clock, Star, Loader2, Sparkles } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  watchTimeLimit: number;
  dailyDownloadLimit: number;
  unlimitedDownloads: boolean;
  features: string[];
  popular?: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const defaultPlans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    watchTimeLimit: 5,
    dailyDownloadLimit: 1,
    unlimitedDownloads: false,
    features: ["5 min watch time/day", "1 download/day", "Basic quality", "Ads included"],
  },
  {
    id: "bronze",
    name: "Bronze",
    price: 10,
    watchTimeLimit: 7,
    dailyDownloadLimit: 3,
    unlimitedDownloads: false,
    features: ["7 min watch time/day", "3 downloads/day", "HD quality", "Fewer ads"],
  },
  {
    id: "silver",
    name: "Silver",
    price: 30,
    watchTimeLimit: 15,
    dailyDownloadLimit: 10,
    unlimitedDownloads: false,
    features: ["15 min watch time/day", "10 downloads/day", "Full HD quality", "Minimal ads"],
    popular: true,
  },
  {
    id: "gold",
    name: "Gold",
    price: 50,
    watchTimeLimit: 30,
    dailyDownloadLimit: 25,
    unlimitedDownloads: false,
    features: ["30 min watch time/day", "25 downloads/day", "4K quality", "No ads"],
  },
  {
    id: "premium",
    name: "Premium",
    price: 100,
    watchTimeLimit: -1,
    dailyDownloadLimit: -1,
    unlimitedDownloads: true,
    features: ["Unlimited watch time", "Unlimited downloads", "4K + HDR", "No ads", "Offline mode", "Priority support"],
  },
];

export default function PremiumPage() {
  const { user } = useUser();
  const [plans, setPlans] = useState<Plan[]>(defaultPlans);
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
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
    fetchPlans();
    if (user) fetchUserPlan();
    loadRazorpay();
  }, [user]);

  const loadRazorpay = () => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  };

  const fetchPlans = async () => {
    try {
      const res = await axiosInstance.get("/payment/plans");
      if (res.data?.length) setPlans(res.data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPlan = async () => {
    try {
      const res = await axiosInstance.get(`/payment/user-plan/${user?._id}`);
      setCurrentPlan(res.data.currentPlan || "free");
    } catch (error) {
      console.error("Error fetching user plan:", error);
    }
  };

  const handleSubscribe = async (plan: Plan) => {
    if (!user) {
      alert("Please sign in to subscribe");
      return;
    }
    if (plan.id === "free" || plan.id === currentPlan) return;

    setProcessingPlan(plan.id);
    try {
      const { data } = await axiosInstance.post("/payment/create-order", {
        planId: plan.id,
        amount: plan.price,
        userId: user._id,
      });

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_FLkMQGK9tbJYxV",
        amount: data.amount,
        currency: "INR",
        name: "YouTube Premium",
        description: `${plan.name} Plan Subscription`,
        order_id: data.orderId,
        handler: async (response: any) => {
          try {
            await axiosInstance.post("/payment/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user._id,
              planId: plan.id,
              subscriptionId: data.subscriptionId,
            });
            setCurrentPlan(plan.id);
            alert(`Successfully subscribed to ${plan.name} plan!`);
            fetchUserPlan(); // Refresh user plan
          } catch (error) {
            console.error("Payment verification failed:", error);
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
        notes: {
          planId: plan.id,
          userId: user._id,
        },
        theme: {
          color: "#FF0000",
        },
        modal: {
          ondismiss: () => {
            setProcessingPlan(null);
          },
        },
      };

      if (typeof window !== "undefined" && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response: any) => {
          console.error("Payment failed:", response.error);
          alert(`Payment failed: ${response.error.description}`);
        });
        rzp.open();
      } else {
        alert("Razorpay not loaded. Please refresh the page.");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order. Please try again.");
    } finally {
      setProcessingPlan(null);
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case "bronze": return "from-orange-600 to-orange-700";
      case "silver": return "from-gray-400 to-gray-500";
      case "gold": return "from-yellow-500 to-yellow-600";
      case "premium": return "from-purple-600 to-pink-600";
      default: return "from-gray-600 to-gray-700";
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "premium": return <Sparkles className="w-6 h-6" />;
      case "gold": return <Crown className="w-6 h-6" />;
      default: return <Star className="w-6 h-6" />;
    }
  };

  const mainClass = isMobile ? "ml-0" : sidebarOpen ? "ml-60" : "ml-[72px]";

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex pt-14">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={isMobile} />
        <main className={`flex-1 transition-all duration-300 pb-16 lg:pb-0 ${mainClass}`}>
          <div className="p-3 sm:p-4 lg:p-6">
            {/* Hero */}
            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white mb-4 sm:mb-6 text-sm sm:text-base">
                <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium">YouTube Premium</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-foreground)] mb-3 sm:mb-4">
                Unlock the full experience
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-[var(--color-muted-foreground)] px-4">
                Choose the plan that's right for you. Upgrade anytime for more features.
              </p>
            </div>

            {/* Current Plan Badge */}
            {currentPlan !== "free" && (
              <div className="flex justify-center mb-6 sm:mb-8">
                <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-green-500/10 text-green-500 text-sm sm:text-base">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium">Current plan: {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</span>
                </div>
              </div>
            )}

            {/* Plans Grid */}
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative rounded-2xl border-2 transition-all ${
                      plan.popular
                        ? "border-[var(--color-primary)] scale-105 shadow-xl"
                        : currentPlan === plan.id
                        ? "border-green-500"
                        : "border-[var(--color-border)] hover:border-[var(--color-muted-foreground)]"
                    }`}
                  >
                    {/* Popular Badge */}
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="px-3 py-1 text-xs font-bold bg-[var(--color-primary)] text-white rounded-full">
                          MOST POPULAR
                        </span>
                      </div>
                    )}

                    {/* Current Plan Badge */}
                    {currentPlan === plan.id && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="px-3 py-1 text-xs font-bold bg-green-500 text-white rounded-full">
                          CURRENT PLAN
                        </span>
                      </div>
                    )}

                    <div className="p-6">
                      {/* Plan Header */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getPlanColor(plan.id)} flex items-center justify-center text-white mb-4`}>
                        {getPlanIcon(plan.id)}
                      </div>
                      
                      <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-1">
                        {plan.name}
                      </h3>
                      
                      <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-3xl font-bold text-[var(--color-foreground)]">
                          ₹{plan.price}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-[var(--color-muted-foreground)]">/month</span>
                        )}
                      </div>

                      {/* Features */}
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-[var(--color-foreground)]">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA Button */}
                      <button
                        onClick={() => handleSubscribe(plan)}
                        disabled={plan.id === "free" || plan.id === currentPlan || processingPlan === plan.id}
                        className={`w-full py-3 rounded-xl font-medium transition-all ${
                          plan.id === currentPlan
                            ? "bg-green-500/20 text-green-500 cursor-default"
                            : plan.id === "free"
                            ? "bg-[var(--color-secondary)] text-[var(--color-muted-foreground)] cursor-default"
                            : plan.popular
                            ? "bg-[var(--color-primary)] text-white hover:bg-red-700"
                            : "bg-[var(--color-secondary)] text-[var(--color-foreground)] hover:bg-[var(--color-accent)]"
                        }`}
                      >
                        {processingPlan === plan.id ? (
                          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        ) : plan.id === currentPlan ? (
                          "Current Plan"
                        ) : plan.id === "free" ? (
                          "Free Forever"
                        ) : (
                          "Subscribe"
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Features Comparison */}
            <div className="mt-16 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-[var(--color-foreground)] text-center mb-8">
                Why upgrade to Premium?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                    <Download className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-[var(--color-foreground)] mb-2">Download Videos</h3>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    Save videos to watch offline, anytime, anywhere.
                  </p>
                </div>
                <div className="p-6 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-6 h-6 text-purple-500" />
                  </div>
                  <h3 className="font-semibold text-[var(--color-foreground)] mb-2">Unlimited Watch Time</h3>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    No daily limits. Watch as much as you want.
                  </p>
                </div>
                <div className="p-6 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] text-center">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-green-500" />
                  </div>
                  <h3 className="font-semibold text-[var(--color-foreground)] mb-2">Ad-Free Experience</h3>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    Enjoy videos without interruptions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
