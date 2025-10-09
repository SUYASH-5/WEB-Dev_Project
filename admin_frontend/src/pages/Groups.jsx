import { useEffect, useState } from "react";
import ThemeToggle from "../Components/ThemeToggle";
import { getGroups, createGroup, removeGroup } from "../api/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await getGroups();
      setGroups(res.data);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  const handleCreate = async () => {
    if (!newGroupName) return;
    try {
      await createGroup({ name: newGroupName });
      setNewGroupName("");
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

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const studentsPerGroup = groups.map((g) => ({
    name: g.name,
    students: g.students?.length || 0,
  }));

  return (
    <div className="flex-1 p-6 bg-gray-100 dark:bg-gray-900 transition-colors duration-300 min-h-screen">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Groups Management
        </h1>
        <ThemeToggle />
      </div>

      {/* Create Group */}
      <div className="flex mb-6 space-x-3">
        <input
          type="text"
          placeholder="New group name"
          className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 flex-1 focus:outline-none focus:ring focus:ring-purple-500"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
        />
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
        >
          Create
        </button>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Students per Group
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={studentsPerGroup}>
            <XAxis dataKey="name" stroke="#8884d8" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="students" fill="#7c3aed" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search groups..."
          className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 w-full focus:outline-none focus:ring focus:ring-purple-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Groups Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          All Groups
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-700 dark:text-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">Group Name</th>
                <th className="px-4 py-2">Teacher</th>
                <th className="px-4 py-2">Students</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map((g) => (
                <tr
                  key={g._id}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="px-4 py-2">{g.name}</td>
                  <td className="px-4 py-2">{g.teacher?.name || "N/A"}</td>
                  <td className="px-4 py-2">{g.students?.length || 0}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleRemove(g._id)}
                      className="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Groups;
