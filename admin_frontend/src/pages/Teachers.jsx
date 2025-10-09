import { useEffect, useState } from "react";
import ThemeToggle from "../Components/ThemeToggle";
import {
  getTeachers,
  getPendingRequests,
  verifyTeacher,
  ignoreTeacher,
  removeTeacher,
} from "../api/api";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#7c3aed", "#a78bfa", "#d8b4fe"];

const Teacher = () => {
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
      setTeachers(allRes.data);
      setPendingTeachers(pendingRes.data);
    } catch (err) {
      console.error("Error fetching teachers:", err);
    }
  };

  const handleVerify = async (id) => {
    try {
      await verifyTeacher(id);
      fetchTeachers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleIgnore = async (id) => {
    try {
      await ignoreTeacher(id);
      fetchTeachers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Remove this teacher?")) return;
    try {
      await removeTeacher(id);
      fetchTeachers();
    } catch (err) {
      console.error(err);
    }
  };

  const verifiedCount = teachers.filter((t) => t.verified).length;
  const pendingCount = pendingTeachers.length;

  const teacherPieData = [
    { name: "Verified", value: verifiedCount },
    { name: "Pending", value: pendingCount },
  ];

  const filteredTeachers = teachers.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 bg-gray-100 dark:bg-gray-900 transition-colors duration-300 min-h-screen">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Teachers Management
        </h1>
        <ThemeToggle />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Teachers
          </h3>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {teachers.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Verified Teachers
          </h3>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {verifiedCount}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Pending Requests
          </h3>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {pendingCount}
          </p>
        </div>
      </div>

      {/* Chart + Search */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Teacher Verification Overview
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={teacherPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {teacherPieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 flex flex-col justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Search Teachers
          </h2>
          <input
            type="text"
            placeholder="Search by name..."
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring focus:ring-purple-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          All Teachers
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-700 dark:text-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Joined</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((t) => (
                <tr
                  key={t._id}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="px-4 py-2">{t.name}</td>
                  <td className="px-4 py-2">{t.email}</td>
                  <td className="px-4 py-2">
                    {t.verified ? (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        Verified
                      </span>
                    ) : (
                      <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 flex items-center justify-center space-x-2">
                    {!t.verified && (
                      <>
                        <button
                          onClick={() => handleVerify(t._id)}
                          className="px-3 py-1 bg-green-500 text-white text-xs rounded-md hover:bg-green-600 transition-colors"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => handleIgnore(t._id)}
                          className="px-3 py-1 bg-yellow-500 text-white text-xs rounded-md hover:bg-yellow-600 transition-colors"
                        >
                          Ignore
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleRemove(t._id)}
                      className="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors"
                    >
                      Remove
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

export default Teacher;
