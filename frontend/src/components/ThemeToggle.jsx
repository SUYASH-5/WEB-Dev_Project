import { useState, useEffect, useRef } from "react";
import gsap from "gsap";

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  const sliderRef = useRef(null);
  const iconRef = useRef(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { duration: 0.4, ease: "power2.out" } });

    tl.to(sliderRef.current, {
      x: darkMode ? 24 : 0,
      backgroundColor: darkMode ? "#1f2937" : "#f3f4f6",
    });

    tl.to(
      iconRef.current,
      {
        rotation: darkMode ? 360 : -360,
        opacity: 0,
        scale: 0.5,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        onRepeat: () => {
          iconRef.current.innerHTML = darkMode
            ? "🌙"
            : "☀️";
        },
      },
      "<"
    );
  }, [darkMode]);

  return (
    <div className="flex items-center space-x-3 p-3">
      <div
        onClick={() => setDarkMode(!darkMode)}
        className="w-14 h-7 bg-gray-200 dark:bg-gray-700 rounded-full relative cursor-pointer transition-colors duration-300 flex items-center px-1"
      >
        <div
          ref={sliderRef}
          className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center text-sm"
        >
          <span ref={iconRef}>{darkMode ? "🌙" : "☀️"}</span>
        </div>
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
        {darkMode ? "Dark Mode" : "Light Mode"}
      </span>
    </div>
  );
};

export default ThemeToggle;
