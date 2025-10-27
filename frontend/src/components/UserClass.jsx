import { useEffect, useState } from "react";
import { getClasses, logout } from "../api/api";
import { FiClock, FiVideo, FiCheckCircle, FiLogOut } from "react-icons/fi";
import ThemeToggle from "./ThemeToggle";
import ClassDetails from "./ClassDetails";
import { useNavigate } from "react-router-dom";

const UserClasses = () => {
  const navigator = useNavigate();
  const [classes, setClasses] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    fetchClasses();
    const interval = setInterval(fetchClasses, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getClasses();
      if (response.status === 200) setClasses(response.data.classes);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch classes.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    console.log("Logout clicked");
    logout();
    navigator("/login");
    // Implement logout logic here
  };

  const filteredClasses = classes.filter((cls) => cls.status === activeTab);

  const tabIcons = {
    upcoming: <FiClock className="inline-block mr-1" />,
    Started: <FiVideo className="inline-block mr-1" />,
    ended: <FiCheckCircle className="inline-block mr-1" />,
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getCountdown = (startTime) => {
    const diff = new Date(startTime) - time;
    if (diff <= 0) return "Starting soon";
    const h = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, "0");
    const m = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, "0");
    const s = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="relative p-8 space-y-8 min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 transition-colors duration-500 border-2 border-amber-900/20 dark:border-amber-100/20 rounded-3xl shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            My Classes
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browse your upcoming, live, and past sessions.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl 
              bg-red-500 hover:bg-red-600 text-white font-semibold shadow-md transition-all"
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center md:justify-start space-x-4 border-b border-gray-200 dark:border-gray-700 pb-3">
        {["upcoming", "Started", "ended"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-5 py-2 rounded-md font-medium capitalize tracking-wide transition-all duration-300
              ${
                activeTab === tab
                  ? "bg-gradient-to-r from-purple-600 to-cyan-400 text-white shadow-md"
                  : "text-gray-500 dark:text-gray-400 hover:text-purple-500 dark:hover:text-cyan-400"
              }`}
          >
            {tabIcons[tab]} {tab}
          </button>
        ))}
      </div>

      {/* Class Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500">
        {loading && (
          <p className="text-center col-span-full text-gray-500 dark:text-gray-400 animate-pulse">
            Loading classes...
          </p>
        )}
        {error && (
          <p className="text-center col-span-full text-red-500">{error}</p>
        )}
        {!loading && !error && filteredClasses.length === 0 && (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-10">
            No {activeTab} classes yet.
          </div>
        )}
        {!loading &&
          !error &&
          filteredClasses.map((cls) => {
            let statusClass =
              "bg-gray-500/20 text-gray-400 border border-gray-500/30";
            if (cls.status === "Started") {
              statusClass =
                "bg-green-500/20 text-green-600 border border-green-500/30";
            } else if (cls.status === "upcoming") {
              statusClass =
                "bg-blue-500/20 text-blue-600 border border-blue-500/30";
            }

            return (
              <button
                key={cls._id}
                type="button"
                aria-label={`Open class ${cls.title}`}
                onClick={() => setSelectedClass(cls)}
                className="relative p-6 rounded-2xl border border-gray-200 dark:border-gray-700 
                  bg-white/70 dark:bg-gray-800/60 backdrop-blur-lg
                  shadow-sm hover:shadow-xl hover:border-purple-500/50 
                  transition-all duration-300 group overflow-hidden text-left"
              >
                {/* Glow Hover */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-cyan-400/10 to-transparent 
                    opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500"
                />

                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2 z-10 relative">
                  {cls.title}{" "}
                  {cls.status === "Started" && (
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse ml-2"></span>
                  )}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-300 z-10 relative">
                  {cls.description || "No description available"}
                </p>

                <div className="flex justify-between items-center mt-4 z-10 relative">
                  {cls.status === "upcoming" ? (
                    <p className="text-xs text-blue-500 dark:text-blue-400 font-semibold">
                      Starts in: {getCountdown(cls.startTime)}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Starts: {new Date(cls.startTime).toLocaleString()}
                    </p>
                  )}
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${statusClass}`}
                  >
                    {cls.status.toUpperCase()}
                  </span>
                </div>
              </button>
            );
          })}
      </div>

      {/* Class Details Modal with fade+scale animation */}
      {selectedClass && (
              <ClassDetails
                isOpen={!!selectedClass}
                onClose={() => setSelectedClass(null)}
                classId={selectedClass._id}
              />
            )}
    </div>
  );
};

export default UserClasses;
