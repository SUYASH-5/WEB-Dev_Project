import { useEffect, useState } from "react";
import ThemeToggle from "../Components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { getStudents, removeStudent, getGroups, logout } from "../api/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStudents();
    fetchGroups();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await getStudents();
      setStudents(res.data.students || []);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await getGroups();
      setGroups(res.data.groups || []);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  const handleRemoveStudent = async (id) => {
    if (!window.confirm("Remove this student?")) return;
    try {
      await removeStudent(id);
      fetchStudents();
      fetchGroups();

    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getGroupName = (groupId) => {
    const group = groups.find((g) => g._id === groupId);
    return group ? group.name : "N/A";
  };

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const studentsPerGroup = groups.map((g) => ({
    name: g.name,
    students: g.students?.length || 0,
  }));

  return (
    <div className="flex-1 min-h-screen px-4 sm:px-6 py-6 bg-gradient-to-br from-[#f9f9fb] via-[#f4f3ff] to-[#ebe9ff] dark:from-[#0f0c29] dark:via-[#302b63] dark:to-[#24243e] text-gray-900 dark:text-gray-100 relative rounded-2xl">
      {/* Neon Blur Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-500/10 dark:from-purple-700/10 dark:to-pink-700/10 blur-3xl -z-10" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100 text-center sm:text-left">
          Students<span className="text-purple-500">.</span>Panel
        </h1>
        <div className="flex flex-wrap justify-center sm:justify-end items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-4 pr-4 py-2 w-full sm:w-64 rounded-md bg-white/70 dark:bg-white/10 border border-gray-300 dark:border-white/20 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none backdrop-blur-sm"
          />
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-md hover:opacity-90 transition-all text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white/70 dark:bg-white/10 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-xl shadow-inner p-6 mb-8">
        <h2 className="text-sm font-semibold mb-4 tracking-wide text-gray-600 dark:text-gray-300 uppercase text-center">
          Students per Group
        </h2>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={studentsPerGroup}>
              <XAxis dataKey="name" stroke="#8884d8" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255,255,255,0.9)",
                  borderRadius: "8px",
                  color: "#111",
                }}
              />
              <Bar dataKey="students" fill="#7c3aed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white/70 dark:bg-white/10 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/50 dark:bg-white/5 border-b border-gray-300 dark:border-white/10 uppercase text-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Group</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s) => (
                  <tr
                    key={s._id}
                    className="border-t border-gray-200 dark:border-white/10 hover:bg-white/50 dark:hover:bg-white/5 transition-all"
                  >
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{s.email}</td>
                    <td className="px-4 py-3">{getGroupName(s.group)}</td>
                    <td className="px-4 py-3 flex justify-center">
                      <button
                        onClick={() => handleRemoveStudent(s._id)}
                        className="px-3 py-1 bg-red-500/20 dark:bg-red-500/10 hover:bg-red-500/40 border border-red-400/30 text-red-700 dark:text-red-300 rounded-md text-xs transition-all"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-gray-500 dark:text-gray-400 italic">
                    No students found.
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

export default Students;
