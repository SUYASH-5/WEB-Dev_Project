import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getClasses, logout } from "../api/api";
import ThemeToggle from "../components/ThemeToggle";
import { LogOut, Layers, Calendar, Hash, Clock } from "lucide-react";

const Notes = () => {
  const [endedClasses, setEndedClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getClasses();
        const ended = data.classes
          .filter((cls) => cls.status === "ended")
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setEndedClasses(ended);
        setFilteredClasses(ended.slice(0, 5));
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedDate) {
      setFilteredClasses(endedClasses.slice(0, 5));
      return;
    }
    const filtered = endedClasses.filter((cls) => {
      const classDate = new Date(cls.updatedAt).toISOString().split("T")[0];
      return classDate === selectedDate;
    });
    setFilteredClasses(filtered);
  }, [selectedDate, endedClasses]);

  const handleLogout = async () => {
    try {
      logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleClassClick = (cls) => {
    navigate(`/notes/${cls._id}`);
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100 dark:bg-[#0f0f11] transition-colors duration-300">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200/30 dark:border-gray-700/40 rounded-xl shadow-sm p-4 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Layers className="text-blue-500" /> Ended Classes
        </h2>

        <div className="flex items-center gap-3">
          <div className="relative w-fit">
            <Calendar
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
              size={16}
            />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-9 pr-3 py-2 bg-white/70 dark:bg-gray-800/80 border border-gray-300/30 dark:border-gray-700/40 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500/40 focus:outline-none transition
              [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
          </div>

          <ThemeToggle />

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg shadow-md transition"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Divider / Section Header */}
      <div className="mt-6 mb-2 border-t border-gray-300/30 dark:border-gray-700/50"></div>
      <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-4">
        {selectedDate
          ? `Showing all ended classes on ${selectedDate}`
          : "Showing the latest 5 ended classes"}
      </h3>

      {/* List */}
      <div className="space-y-4">
        {filteredClasses.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-10 text-lg">
            No classes found for this date.
          </div>
        ) : (
          filteredClasses.map((cls, index) => (
            <div
              key={cls._id}
              onClick={() => handleClassClick(cls)}
              className="flex items-center justify-between bg-white/90 dark:bg-gray-800/80 hover:bg-blue-50 dark:hover:bg-gray-700/70 border border-gray-300/30 dark:border-gray-700/40 rounded-xl p-5 cursor-pointer backdrop-blur-md transition-all duration-200 hover:shadow-md group"
            >
              <div className="flex items-start gap-4">
                <div className="text-blue-600 dark:text-blue-400 font-semibold text-lg flex items-center justify-center w-6">
                  {index + 1}.
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    {cls.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {cls.description || "No description available"}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 dark:text-gray-400">
                    <Clock size={12} />
                    {new Date(cls.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <Hash
                className="text-gray-400 group-hover:text-blue-500 transition duration-200"
                size={20}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notes;
