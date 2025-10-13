import { useEffect, useState } from "react";
import ThemeToggle from "../Components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import {
  getGroups,
  createGroup,
  removeGroup,
  getTeachers,
  logout,
} from "../api/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const Groups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await getGroups();
      const tRes = await getTeachers();
      const teachers = tRes.data.teachers || [];

      const groupsWithTeachers = (res.data.groups || []).map((g) => ({
        ...g,
        teacher: teachers.find((t) => t._id === g.teacher) || null,
      }));
      setGroups(groupsWithTeachers);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  const handleCreate = async () => {
    if (!newGroupName) return;
    try {
      await createGroup({ name: newGroupName, description: newGroupDesc });
      setNewGroupName("");
      setNewGroupDesc("");
      fetchGroups();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Delete this group?")) return;
    try {
      await removeGroup(id);
      fetchGroups();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const studentsPerGroup = groups.map((g) => ({
    name: g.name,
    students: g.students?.length || 0,
  }));

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-gray-100 px-6 py-8 relative overflow-hidden rounded-2xl">
      {/* Neon glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-500/10 blur-3xl -z-10" />

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-8 gap-3">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Groups<span className="text-purple-400">.</span>Panel
        </h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-md hover:opacity-90 transition-all text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Create Group + Search */}
      <div className="flex flex-col md:flex-row gap-3 mb-6 items-center">
        <input
          type="text"
          placeholder="New group name"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          className="flex-1 px-3 py-2 rounded-md bg-white/10 border border-white/20 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring focus:ring-purple-500 backdrop-blur-sm"
        />
        <input
          type="text"
          placeholder="Description"
          value={newGroupDesc}
          onChange={(e) => setNewGroupDesc(e.target.value)}
          className="flex-1 px-3 py-2 rounded-md bg-white/10 border border-white/20 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring focus:ring-purple-500 backdrop-blur-sm"
        />
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
        >
          Create
        </button>
        <input
          type="text"
          placeholder="Search groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 rounded-md bg-white/10 border border-white/20 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring focus:ring-purple-500 backdrop-blur-sm"
        />
      </div>

      {/* Stats + Chart */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        <div className="md:col-span-7 grid grid-cols-3 gap-3">
          {[
            { title: "Groups", value: groups.length, color: "violet" },
            {
              title: "Teachers",
              value: groups.filter((g) => g.teacher).length,
              color: "emerald",
            },
            {
              title: "Students",
              value: groups.reduce(
                (acc, g) => acc + (g.students?.length || 0),
                0
              ),
              color: "amber",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`group relative overflow-hidden rounded-xl px-4 py-4 flex flex-col items-center justify-center text-center transition-all duration-300 border border-${stat.color}-500/30 bg-gradient-to-br from-${stat.color}-600/20 to-${stat.color}-900/10 dark:from-${stat.color}-500/20 dark:to-${stat.color}-700/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] hover:scale-[1.04] hover:shadow-lg hover:border-${stat.color}-500/60`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                {stat.title}
              </h3>
              <p
                className={`text-2xl font-extrabold mt-1 text-${stat.color}-500 dark:text-${stat.color}-400 drop-shadow-[0_0_2px_rgba(0,0,0,0.3)]`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="md:col-span-5 p-5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner flex flex-col justify-center">
          <h2 className="text-sm font-semibold mb-3 tracking-wide text-gray-300 uppercase text-center">
            Students per Group
          </h2>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentsPerGroup}>
                <XAxis dataKey="name" stroke="#8884d8" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(30,30,40,0.9)",
                    border: "none",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="students" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Groups Table */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 border-b border-white/10 uppercase text-gray-400">
            <tr>
              <th className="px-4 py-3 text-left">Group Name</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Teacher</th>
              <th className="px-4 py-3 text-left">Students</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.map((g) => (
              <tr
                key={g._id}
                className="border-t border-white/10 hover:bg-white/5 transition-all"
              >
                <td className="px-4 py-3 font-medium">{g.name}</td>
                <td className="px-4 py-3">{g.description || "N/A"}</td>
                <td className="px-4 py-3">{g.teacher?.name || "N/A"}</td>
                <td className="px-4 py-3">{g.students?.length || 0}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleRemove(g._id)}
                    className="px-3 py-1 bg-red-500/20 hover:bg-red-500/40 border border-red-400/30 text-red-300 rounded-md text-xs transition-all"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredGroups.length === 0 && (
              <tr>
                <td colSpan="5" className="py-6 text-center text-gray-400 italic">
                  No groups found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Groups;
