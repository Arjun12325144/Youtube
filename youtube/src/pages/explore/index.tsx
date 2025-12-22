"use client";

import { useState, useEffect } from "react";
import CategoryTabs from "@/components/category-tabs";
import Videogrid from "@/components/Videogrid";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Flame, Music2, Gamepad2, Newspaper, Trophy } from "lucide-react";

const trendingCategories = [
  { icon: Flame, label: "Trending", color: "text-orange-500" },
  { icon: Music2, label: "Music", color: "text-pink-500" },
  { icon: Gamepad2, label: "Gaming", color: "text-green-500" },
  { icon: Newspaper, label: "News", color: "text-blue-500" },
  { icon: Trophy, label: "Sports", color: "text-yellow-500" },
];

export default function ExplorePage() {
  const [category, setCategory] = useState<string>("All");
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

  const mainClass = isMobile ? "ml-0" : sidebarOpen ? "ml-60" : "ml-[72px]";

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex pt-14">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={isMobile} />
        <main className={`flex-1 transition-all duration-300 pb-16 lg:pb-0 ${mainClass}`}>
          <div className="p-3 sm:p-4 lg:p-6">
            {/* Hero Section */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-foreground)] mb-2">Explore</h1>
              <p className="text-sm sm:text-base text-[var(--color-muted-foreground)]">Discover trending videos and popular content</p>
            </div>

            {/* Quick Categories */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4 mb-6 sm:mb-8">
              {trendingCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.label}
                    onClick={() => setCategory(cat.label)}
                    className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl transition-all ${
                      category === cat.label
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-[var(--color-secondary)] text-[var(--color-foreground)] hover:bg-[var(--color-accent)]"
                    }`}
                  >
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${category === cat.label ? "text-white" : cat.color}`} />
                    <span className="font-medium text-sm sm:text-base">{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Category Tabs */}
            <CategoryTabs onCategoryChange={(c) => setCategory(c)} initial={category} />
            
            {/* Video Grid */}
            <Videogrid filterCategory={category} />
          </div>
        </main>
      </div>
    </div>
  );
}
