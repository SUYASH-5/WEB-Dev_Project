import { useRef, useEffect, useMemo, useState } from "react";
import gsap from "gsap";
import {
  BookOpen,
  Clock,
  Braces,
  Settings as SettingsIcon,
} from "lucide-react";
import { useAuth } from "../context/UseAuth";
import Settings from "../pages/Setting";

const UserSidebar = ({ activeSection, setActiveSection }) => {
  const sidebarRef = useRef(null);
  const settingsBtnRef = useRef(null);
  const { user } = useAuth();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const menuItems = useMemo(() => {
    const items = [
      { name: "Classes", key: "classes", icon: BookOpen },
      { name: "History", key: "history", icon: Clock },
      { name: "Code Editor", key: "codeeditor", icon: Braces },
    ];
    if (user && user.role === "teacher") {
      items.push({
        name: "Manage Classes",
        key: "manageclasses",
        icon: BookOpen,
      });
    }
    return items;
  }, [user]);

  useEffect(() => {
    if (!sidebarRef.current) return;

    const wrappers = sidebarRef.current.querySelectorAll(".menu-wrapper");

    gsap.fromTo(
      sidebarRef.current,
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
    );

    gsap.fromTo(
      wrappers,
      { x: -30, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.1,
        delay: 0.2,
        ease: "power2.out",
      }
    );
  }, [menuItems]);

  useEffect(() => {
    const el = settingsBtnRef.current;
    if (!el) return;

    el.addEventListener("mouseenter", () => {
      gsap.to(el, {
        scale: 1.08,
        rotate: 5,
        duration: 0.2,
        ease: "power1.out",
      });
    });
    el.addEventListener("mouseleave", () => {
      gsap.to(el, { scale: 1, rotate: 0, duration: 0.3, ease: "power1.inOut" });
    });

    return () => {
      el.removeEventListener("mouseenter", null);
      el.removeEventListener("mouseleave", null);
    };
  }, []);

  return (
    <>
      <aside
        ref={sidebarRef}
        className="w-64 flex-shrink-0 relative bg-gradient-to-b from-purple-400 via-purple-500 to-purple-600
                   dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 text-white p-6 flex flex-col shadow-2xl
                   transition-colors duration-300 overflow-hidden"
      >
        <div className="flex items-center mb-10 justify-center relative z-10">
            <div
              className="absolute -inset-2 rounded-3xl 
               bg-gradient-to-tr from-purple-400 via-pink-400 to-indigo-500 
               dark:from-indigo-700 dark:via-purple-600 dark:to-pink-700 
               blur-3xl opacity-40 dark:opacity-50 
               animate-pulse-slow pointer-events-none"
            ></div>
            <div
              className="relative w-32 h-32 rounded-full overflow-hidden flex items-center justify-center
                  bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-inner">
              <img
                src="./logo.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

        <nav className="flex flex-col space-y-3 relative z-10">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.key;

            return (
              <div key={item.key} className="menu-wrapper relative">
                {isActive && (
                  <span className="absolute left-0 top-0 h-full w-1 rounded-r-full shadow-md"></span>
                )}
                <button
                  onClick={() => setActiveSection(item.key)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg w-full font-medium text-sm transition-all duration-300
                    transform relative z-10 ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md"
                        : "text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-800/50"
                    }`}
                >
                  <Icon size={22} />
                  <span>{item.name}</span>
                </button>
              </div>
            );
          })}
        </nav>

        <div className="mt-auto pt-5 border-t border-white/10 dark:border-gray-800/50 relative">
          <div className="absolute inset-x-0 -top-px h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent blur-sm"></div>

          {/* ⚙️ Settings Button */}
          <button
            ref={settingsBtnRef}
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center justify-center gap-2 mt-5 px-4 py-3 rounded-lg font-medium text-sm
                       bg-white/20 hover:bg-white/30 text-white dark:text-gray-200 dark:hover:bg-gray-800/50
                       transition-all duration-300 backdrop-blur-sm"
          >
            <SettingsIcon size={20} />
            Settings
          </button>

          <p className="text-xs text-gray-700 dark:text-gray-400 text-center mt-4">
            © 2025{" "}
            <span className="text-purple-200 dark:text-purple-700 font-semibold">
              Collab
            </span>
          </p>
        </div>
      </aside>

      {/* Settings Popup */}
      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};

export default UserSidebar;
