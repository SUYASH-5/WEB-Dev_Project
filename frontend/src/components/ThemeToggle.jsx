import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { Sun, Moon } from "lucide-react"; // ✅ clean vector icons

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
  const iconWrapperRef = useRef(null);

  // 🔄 Apply theme to document + localStorage
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

    gsap.fromTo(
      iconWrapperRef.current,
      { rotate: 0 },
      {
        rotate: darkMode ? 360 : -360,
        duration: 0.6,
        ease: "power2.inOut",
      }
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
          className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center text-sm overflow-hidden"
        >
          <div ref={iconWrapperRef}>
            {darkMode ? (
              <Moon className="w-3.5 h-3.5 text-gray-800 dark:text-gray-100" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-yellow-400" />
            )}
          </div>
        </div>
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
        {darkMode ? "Dark Mode" : "Light Mode"}
      </span>
    </div>
  );
};

export default ThemeToggle;
