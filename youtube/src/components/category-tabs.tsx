// import React,{useState} from 'react'
// import { Button } from './ui/button';
// const categories = [
//     "All",
//     "Music",
//     "Gaming",
//     "Movies",
//     "News",
//     "Sports",
//     "Technology",
//     "Comedy",
//     "Education",
//     "Science",
//     "Travel",
//     "Food",
//     "Fashion",
// ]
// const categorytabs = ()=>{
//     const [activeCategory, setActiveCategory] = useState("All");
//     return (
//         <div className='flex gap-2 mb-6 overflow-x-auto pb-2'>
//             {categories.map((cat)=>(
//                 <Button className='whitespace-nowrap' variant={activeCategory === cat?"default":"secondary"} key={cat} onClick={()=>setActiveCategory(cat)}>{cat}</Button>
//         ))}</div>
//     )
// }
// export default categorytabs;
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const categories = [
  "All",
  "Music",
  "Gaming",
  "Movies",
  "News",
  "Sports",
  "Technology",
  "Comedy",
  "Education",
  "Science",
  "Travel",
  "Food",
  "Fashion",
];

interface Props {
  onCategoryChange?: (category: string) => void;
  initial?: string;
}

export default function CategoryTabs({ onCategoryChange, initial }: Props) {
  const [activeCategory, setActiveCategory] = useState(initial || "All");

  const handleClick = (category: string) => {
    setActiveCategory(category);
    if (onCategoryChange) onCategoryChange(category);
  };

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {categories.map((category) => (
        <Button
          key={category}
          variant={activeCategory === category ? "default" : "secondary"}
          className="whitespace-nowrap"
          onClick={() => handleClick(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}