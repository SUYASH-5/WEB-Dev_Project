import { useState } from "react";
import Sidebar from "../Components/Sidebar";
import Content from "./content";
import Teachers from "./Teachers";
import Students from "./Students";
import Groups from "./Groups";
import Requests from "./Requests";
import Settings from "./Setting";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderSection = () => {
    switch (activeSection) {
      case "teachers":
        return <Teachers />;
      case "students":
        return <Students />;
      case "groups":
        return <Groups />;
      case "pending":
        return <Requests />;
      case "settings":
        return <Settings />;
      default:
        return <Content />;
    }
  };

  return (
    <div className="flex">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <div className="flex-1 min-h-screen ml-60 p-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {renderSection()}
      </div>
    </div>
  );
};

export default Dashboard;
