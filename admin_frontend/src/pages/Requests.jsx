import { useEffect, useState } from "react";
import ThemeToggle from "../Components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { getTeachers, getStudents, getGroups, logout } from "../api/api";

const Requests = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [tRes, sRes, gRes] = await Promise.all([
          getTeachers(),
          getStudents(),
          getGroups(),
        ]);
        setTeachers(tRes.data.teachers);
        setStudents(sRes.data.students);
        setGroups(gRes.data.groups);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };
    fetchReports();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const className = (groupId) => {
    const group = groups.find((g) => g._id === groupId);
    return group ? group.name : null;
  };

  const verifiedTeachers = teachers.filter((t) => t.ValidityState === "valid").length;
  const totalStudents = students.length;
  const totalClasses = groups.length;
  const pendingRequests = teachers.filter((t) => t.ValidityState !== "valid").length;

  return (
    <div className="flex-1 p-6 bg-gradient-to-br from-[#f9f9fb] via-[#f4f3ff] to-[#ebe9ff] dark:from-[#0f0c29] dark:via-[#302b63] dark:to-[#24243e] min-h-screen relative text-gray-900 dark:text-gray-100 rounded-2xl">
      {/* Neon blur background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-500/10 dark:from-purple-700/10 dark:to-pink-700/10 blur-3xl -z-10" />

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100">
          Reports
        </h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-md hover:opacity-90 transition-all text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Verified Teachers", value: verifiedTeachers },
          { title: "Total Students", value: totalStudents },
          { title: "Total Classes", value: totalClasses },
          { title: "Pending Requests", value: pendingRequests },
        ].map((card, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-xl px-5 py-6 bg-white/70 dark:bg-white/10 shadow-lg hover:shadow-2xl transition-all border border-gray-300 dark:border-white/20"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-10 transition-opacity rounded-xl"></div>
            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              {card.title}
            </h3>
            <p className="mt-2 text-3xl font-extrabold text-purple-700 dark:text-violet-300 drop-shadow-sm">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teachers Table */}
        <div className="bg-white/70 dark:bg-white/10 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            All Teachers
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700 dark:text-gray-200">
              <thead className="bg-white/50 dark:bg-white/5 border-b border-gray-300 dark:border-white/10 uppercase">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Verified</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr
                    key={t._id}
                    className="border-t border-gray-200 dark:border-white/10 hover:bg-white/50 dark:hover:bg-white/5 transition-all"
                  >
                    <td className="px-4 py-2">{t.name}</td>
                    <td className="px-4 py-2">{t.email}</td>
                    <td className="px-4 py-2">{t.ValidityState === "valid" ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white/70 dark:bg-white/10 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            All Students
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700 dark:text-gray-200">
              <thead className="bg-white/50 dark:bg-white/5 border-b border-gray-300 dark:border-white/10 uppercase">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Class</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr
                    key={s._id}
                    className="border-t border-gray-200 dark:border-white/10 hover:bg-white/50 dark:hover:bg-white/5 transition-all"
                  >
                    <td className="px-4 py-2">{s.name}</td>
                    <td className="px-4 py-2">{s.email}</td>
                    <td className="px-4 py-2">{className(s.group) || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Requests;
