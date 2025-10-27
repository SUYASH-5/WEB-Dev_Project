import { useState } from "react";
import UserSidebar from "../components/Sidebar";
import Classes from "./Classes";
import Notes from "./Notes";
import Code from "./Code";
import Management from "./Management";
const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("classes");

  const renderSection = () => {
    switch (activeSection) {
      case "classes":
        return <Classes />;
      case "history":
        return <Notes />;
      case "codeeditor":
        return <Code />;
      case "manageclasses":
        return <Management />;
      default:
        return <Classes />;
    }
  };

  return (
    <div
  className="flex h-screen bg-gradient-to-br from-gray-100 via-white to-gray-50 
  dark:from-gray-950 dark:via-gray-900 dark:to-gray-950
  transition-colors duration-700"
>
  {/* Sidebar */}
  <UserSidebar
    activeSection={activeSection}
    setActiveSection={setActiveSection}
  />

  {/* Main content */}
  <main
    className="flex-1 p-6 overflow-auto relative
    bg-gradient-to-br from-white/70 via-white/40 to-purple-50/60 
    dark:from-gray-900/60 dark:via-gray-800/40 dark:to-gray-900/60
    backdrop-blur-2xl shadow-inner border-l border-white/10 dark:border-gray-700/30
    transition-all duration-500"
  >
    {/* Subtle background glow for continuity */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/10 blur-3xl rounded-full"></div>
      <div className="absolute bottom-10 left-0 w-[300px] h-[300px] bg-cyan-400/10 blur-3xl rounded-full"></div>
    </div>

    <div className="relative z-10">
      {renderSection()}
    </div>
  </main>
</div>

  );
};

export default Dashboard;
