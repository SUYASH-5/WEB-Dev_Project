import { useRef, useEffect } from "react";
import gsap from "gsap";
import { BookOpen, Clock,Braces } from "lucide-react";

const UserSidebar = ({ activeSection, setActiveSection }) => {
  const sidebarRef = useRef(null);

  const menuItems = [
    { name: "Classes", icon: BookOpen },
    { name: "History", icon: Clock },
    { name: "Code Editor", icon: Braces },
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
      className="fixed left-0 top-0 h-full w-56
                 bg-gradient-to-b from-purple-100 via-purple-200 to-purple-300
                 dark:from-[#3b0764] dark:via-[#4c1d95] dark:to-[#2e1065]
                 text-gray-900 dark:text-gray-100 flex flex-col p-4 shadow-2xl transition-colors duration-300"
    >
      <div className="flex items-center mb-5 space-x-2">
        <img src="./logo.png" alt="User Icon" className="w-15 h-20" />
        <h1 className="text-xl font-semibold tracking-wide">User Panel</h1>
      </div>

      <nav className="flex flex-col space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.name.toLowerCase();

          return (
            <div key={item.name} className="menu-wrapper">
              <button
                onClick={() => setActiveSection(item.name.toLowerCase())}
                className={`flex items-center space-x-3 py-2 px-3 rounded-md w-full text-sm font-medium transition-colors duration-200
                  ${
                    isActive
                      ? "bg-purple-400 text-white dark:bg-violet-400"
                      : "hover:bg-purple-200 dark:hover:bg-violet-700/40 dark:hover:text-white"
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
        © 2025 Code-Mate
      </div>
    </aside>
  );
};

export default UserSidebar;
