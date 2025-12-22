"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface UserLocation {
  city: string;
  state: string;
  country: string;
  isSouthIndia: boolean;
}

interface ThemeContextType {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  userLocation: UserLocation | null;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const SOUTH_INDIAN_STATES = [
  "tamil nadu",
  "kerala",
  "karnataka",
  "andhra pradesh",
  "telangana",
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const setTheme = (newTheme: "light" | "dark") => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  // Apply theme to DOM
  useEffect(() => {
    setMounted(true);
    
    // Check saved theme first
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setThemeState(savedTheme);
    }
  }, []);

  // Set theme based on time (no location API needed)
  useEffect(() => {
    const setThemeByTime = () => {
      const savedTheme = localStorage.getItem("theme");
      if (!savedTheme) {
        const currentHour = new Date().getHours();
        // Light theme during day (6am - 6pm), dark otherwise
        setThemeState(currentHour >= 6 && currentHour < 18 ? "light" : "dark");
      }
      setIsLoading(false);
    };

    setThemeByTime();
  }, []);

  // Apply theme classes to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const body = document.body;

    if (theme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
      body.style.backgroundColor = "#0f0f0f";
      body.style.color = "#f1f1f1";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
      body.style.backgroundColor = "#ffffff";
      body.style.color = "#0f0f0f";
    }
  }, [theme, mounted]);

  // Prevent flash of wrong theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, userLocation, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function getOTPMethod(state: string): "email" | "sms" {
  const isSouthIndia = SOUTH_INDIAN_STATES.some((s) =>
    state?.toLowerCase().includes(s)
  );
  return isSouthIndia ? "email" : "sms";
}
