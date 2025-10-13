import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  BarChart3,
  Settings,
} from "lucide-react";

const Sidebar = ({ activeSection, setActiveSection }) => {
  const sidebarRef = useRef(null);

  const menuItems = [
    { name: "Dashboard", key: "dashboard", icon: LayoutDashboard },
    { name: "Teachers", key: "teachers", icon: Users },
    { name: "Classes", key: "groups", icon: BookOpen },
    { name: "Students", key: "students", icon: GraduationCap },
    { name: "Reports", key: "pending", icon: BarChart3 },
    { name: "Settings", key: "settings", icon: Settings },
  ];

  useEffect(() => {
    const wrappers = sidebarRef.current.querySelectorAll(".menu-wrapper");

    gsap.fromTo(
      sidebarRef.current,
      { x: -40, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
    );

    gsap.fromTo(
      wrappers,
      { x: -20, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
        stagger: 0.1,
        delay: 0.3,
      }
    );
  }, []);

  return (
    <aside
      ref={sidebarRef}
      className="fixed left-0 top-0 h-full w-60 
             bg-gradient-to-b from-[#fff0f5] via-[#f3e8ff] to-[#e0d4ff] 
             text-gray-900 flex flex-col p-4 shadow-2xl transition-colors duration-300
             dark:bg-gradient-to-b dark:from-[#3b0764] dark:via-[#4c1d95] dark:to-[#2e1065] 
             dark:text-gray-100"
    >
      {/* Logo */}
      <div className="flex items-center mb-5 space-x-2">
          <img src="./logo.png" alt="Logo" className="h-20 w-15" />
        <h1 className="text-xl font-semibold tracking-wide">Admin Panel</h1>
      </div>

      {/* Menu */}
      <nav className="flex flex-col space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.key;

          return (
            <div key={item.key} className="menu-wrapper">
              <button
                onClick={() => setActiveSection(item.key)}
                className={`flex items-center space-x-3 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 w-full
                  ${
                    isActive
                      ? "bg-purple-400 text-white dark:bg-violet-400"
                      : "text-gray-900 hover:bg-purple-200 dark:text-gray-300 dark:hover:bg-violet-700/40 dark:hover:text-white"
                  }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </button>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto text-xs text-gray-600 dark:text-gray-300 pt-6 border-t border-gray-300/40 dark:border-violet-800/40">
        © 2025 Code-Mate Admin
      </div>
    </aside>
  );
};

export default Sidebar;
