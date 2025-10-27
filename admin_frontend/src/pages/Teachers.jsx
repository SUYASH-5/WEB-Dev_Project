import { useEffect, useState } from "react";
import ThemeToggle from "../Components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import {
  getTeachers,
  getPendingRequests,
  verifyTeacher,
  ignoreTeacher,
  removeTeacher,
  logout,
} from "../api/api";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Check, XCircle, Trash2, Search, LogOut } from "lucide-react";

const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd"];



const Teacher = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const [allRes, pendingRes] = await Promise.all([
        getTeachers(),
        getPendingRequests(),
      ]);
      setTeachers(allRes.data.teachers || []);
      setPendingTeachers(pendingRes.data.requests || []);
    } catch (err) {
      console.error("Error fetching teachers:", err);
    }
  };

  const handleVerify = async (id) => {
    await verifyTeacher(id);
    fetchTeachers();
  };

  const handleIgnore = async (id) => {
    await ignoreTeacher(id);
    fetchTeachers();
  };

  const handleRemove = async (id) => {
    if (window.confirm("Remove this teacher?")) {
      await removeTeacher(id);
      fetchTeachers();
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const verifiedCount = teachers.filter(
    (t) => t.ValidityState === "valid"
  ).length;
  const pendingCount = pendingTeachers.length;

  const teacherPieData = [
    { name: "Verified", value: verifiedCount },
    { name: "Pending", value: pendingCount },
  ];

  const filteredTeachers = teachers.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-[#f9f9fb] via-[#f4f3ff] to-[#ebe9ff] dark:from-[#0f0c29] dark:via-[#302b63] dark:to-[#24243e] text-gray-900 dark:text-gray-100 px-4 sm:px-6 py-6 relative rounded-2xl">
      {/* Neon blur overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-500/10 dark:from-purple-700/10 dark:to-pink-700/10 blur-3xl -z-10" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100 text-center sm:text-left">
          Teacher<span className="text-purple-500">.</span>Panel
        </h1>
        <div className="flex flex-wrap justify-center sm:justify-end items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <Search
              className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400 z-10 pointer-events-none"
              size={18}
            />
            <input
              type="text"
              placeholder="Search teacher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-md bg-white/70 dark:bg-white/10 border border-gray-300 dark:border-white/20 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none backdrop-blur-sm relative z-0"
            />
          </div>
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-md hover:opacity-90 transition-all text-sm"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Stats + Chart Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
        {/* Stats Cards */}
        <div className="md:col-span-7 grid grid-cols-3 gap-3">
          {[
            { title: "Total", value: teachers.length, color: "violet" },
            { title: "Verified", value: verifiedCount, color: "emerald" },
            { title: "Pending", value: pendingCount, color: "amber" },
          ].map((stat, i) => (
            <div
              key={i}
              className={`group relative overflow-hidden rounded-xl px-4 py-5 flex flex-col items-center justify-center text-center transition-all duration-300 border border-${stat.color}-500/30 bg-gradient-to-br from-${stat.color}-600/20 to-${stat.color}-900/10 dark:from-${stat.color}-500/20 dark:to-${stat.color}-700/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] hover:scale-[1.04] hover:shadow-lg hover:border-${stat.color}-500/60`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <h3 className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                {stat.title}
              </h3>
              <p
                className={`text-3xl font-extrabold mt-1 text-${stat.color}-600 dark:text-${stat.color}-400 drop-shadow-[0_0_2px_rgba(0,0,0,0.3)]`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="md:col-span-5 p-5 rounded-lg bg-white/70 dark:bg-white/10 backdrop-blur-md border border-gray-300 dark:border-white/20 shadow-inner flex flex-col justify-center">
          <h2 className="text-sm font-semibold mb-3 tracking-wide text-gray-600 dark:text-gray-300 uppercase text-center">
            Verification Overview
          </h2>
          <div className="h-[180px] sm:h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={teacherPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  labelLine={true}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {teacherPieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.9)",
                    borderRadius: "8px",
                    color: "#111",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white/70 dark:bg-white/10 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/50 dark:bg-white/5 border-b border-gray-300 dark:border-white/10 uppercase text-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Joined</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((t) => (
                <tr
                  key={t._id}
                  className="border-t border-gray-200 dark:border-white/10 hover:bg-white/50 dark:hover:bg-white/5 transition-all"
                >
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {t.email}
                  </td>
                  <td className="px-4 py-3">
                    {t.ValidityState === "valid" ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        Verified
                      </span>
                    ) : t.ValidityState === "invalid" ? (
                      <span className="text-red-600 dark:text-red-400 font-semibold">
                        Rejected
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 flex justify-center flex-wrap gap-2">
                    {t.ValidityState === "pending" && (
                      <>
                        <button
                          onClick={() => handleVerify(t._id)}
                          className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 dark:bg-emerald-500/10 hover:bg-emerald-500/40 border border-emerald-400/30 text-emerald-700 dark:text-emerald-300 rounded-md text-xs transition-all"
                        >
                          <Check size={14} /> Verify
                        </button>
                        <button
                          onClick={() => handleIgnore(t._id)}
                          className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 dark:bg-amber-500/10 hover:bg-amber-500/40 border border-amber-400/30 text-amber-700 dark:text-amber-300 rounded-md text-xs transition-all"
                        >
                          <XCircle size={14} /> Ignore
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleRemove(t._id)}
                      className="flex items-center gap-1 px-3 py-1 bg-red-500/20 dark:bg-red-500/10 hover:bg-red-500/40 border border-red-400/30 text-red-700 dark:text-red-300 rounded-md text-xs transition-all"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTeachers.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="py-6 text-center text-gray-500 dark:text-gray-400 italic"
                  >
                    No teachers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Teacher;
