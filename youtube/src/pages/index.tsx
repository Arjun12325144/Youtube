"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import CategoryTabs from "@/components/category-tabs";
import Videogrid from "@/components/Videogrid";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex pt-14">
        <Sidebar isOpen={sidebarOpen} />
        
        <main
          className={`flex-1 min-h-[calc(100vh-56px)] transition-all duration-300 overflow-x-hidden ${
            sidebarOpen ? "ml-60" : "ml-[72px]"
          }`}
        >
          <div className="p-6 max-w-full">
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
