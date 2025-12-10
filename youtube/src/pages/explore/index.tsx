"use client";

import React, { useState } from "react";
import CategoryTabs from "@/components/category-tabs";
import Videogrid from "@/components/Videogrid";

export default function ExplorePage() {
  const [category, setCategory] = useState<string>("All");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Explore</h1>
      <CategoryTabs onCategoryChange={(c) => setCategory(c)} initial={category} />

      <div className="mt-4">
        <Videogrid filterCategory={category} />
      </div>
    </div>
  );
}
