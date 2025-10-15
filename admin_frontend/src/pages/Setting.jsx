import { useState } from "react";
import ThemeToggle from "../Components/ThemeToggle";
import { logout } from "../api/api";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@example.com");
  const [username, setUsername] = useState("admin");

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex-1 min-h-screen relative bg-gradient-to-br from-[#f9f9fb] via-[#f4f3ff] to-[#ebe9ff] dark:from-[#0f0c29] dark:via-[#302b63] dark:to-[#24243e] text-gray-900 dark:text-gray-100 p-6 rounded-2xl">

      {/* Neon blur background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-500/10 dark:from-purple-700/10 dark:to-pink-700/10 blur-3xl -z-10 "></div>

      {/* Header + Logout */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-4 sm:mb-0">
          Settings
        </h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg shadow hover:opacity-90 transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Account Card */}
        <div className="bg-white/80 dark:bg-white/10 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Account</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white/70 dark:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white/70 dark:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="bg-white/80 dark:bg-white/10 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all lg:col-span-3">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Security</h2>
          <div className="flex flex-col sm:flex-row sm:gap-4 gap-2">
            <button
              onClick={handleLogout}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg hover:opacity-90 transition-all"
            >
              Logout
            </button>
            <button
              onClick={() => alert("Password change flow")}
              className="flex-1 px-6 py-3 border border-purple-500 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-500/10 transition-all"
            >
              Change Password
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
