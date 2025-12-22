"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import CategoryTabs from "@/components/category-tabs";
import Videogrid from "@/components/Videogrid";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Open sidebar by default on desktop
      if (!mobile) setSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex pt-14">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={isMobile} />
        
        <main
          className={`flex-1 min-h-[calc(100vh-56px)] transition-all duration-300 overflow-x-hidden pb-16 lg:pb-0 ${
            isMobile ? "ml-0" : sidebarOpen ? "ml-60" : "ml-[72px]"
          }`}
        >
          <div className="p-3 sm:p-4 lg:p-6 max-w-full">
            <CategoryTabs 
              initial={activeCategory}
              onCategoryChange={setActiveCategory} 
            />
            <Videogrid filterCategory={activeCategory} />
          </div>
        </main>
      </div>
    </div>
  );
}
