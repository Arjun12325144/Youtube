"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const categories = [
  "All",
  "Music",
  "Gaming",
  "Live",
  "News",
  "Sports",
  "Learning",
  "Fashion",
  "Podcasts",
  "Comedy",
  "Movies",
  "Cooking",
  "Nature",
  "Technology",
  "Travel",
  "Fitness",
];

interface CategoryTabsProps {
  onCategoryChange?: (category: string) => void;
  initial?: string;
}

export default function CategoryTabs({ onCategoryChange, initial = "All" }: CategoryTabsProps) {
  const [activeCategory, setActiveCategory] = useState(initial);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleClick = (category: string) => {
    setActiveCategory(category);
    onCategoryChange?.(category);
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, []);

  return (
    <div className="relative flex items-center mb-6">
      {/* Left Arrow */}
      {showLeftArrow && (
        <div className="absolute left-0 z-10 flex items-center h-full bg-gradient-to-r from-[var(--color-background)] via-[var(--color-background)] to-transparent pr-4">
          <button
            onClick={() => scroll("left")}
            className="p-1.5 rounded-full bg-[var(--color-secondary)] hover:bg-[var(--color-accent)] transition-colors shadow-md"
          >
            <ChevronLeft className="w-5 h-5 text-[var(--color-foreground)]" />
          </button>
        </div>
      )}

      {/* Categories */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide py-1 px-1"
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleClick(category)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === category
                ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
                : "bg-[var(--color-secondary)] text-[var(--color-foreground)] hover:bg-[var(--color-accent)]"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Right Arrow */}
      {showRightArrow && (
        <div className="absolute right-0 z-10 flex items-center h-full bg-gradient-to-l from-[var(--color-background)] via-[var(--color-background)] to-transparent pl-4">
          <button
            onClick={() => scroll("right")}
            className="p-1.5 rounded-full bg-[var(--color-secondary)] hover:bg-[var(--color-accent)] transition-colors shadow-md"
          >
            <ChevronRight className="w-5 h-5 text-[var(--color-foreground)]" />
          </button>
        </div>
      )}
    </div>
  );
}
