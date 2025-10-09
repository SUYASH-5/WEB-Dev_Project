import { useEffect, useState } from "react";
import ThemeToggle from "../Components/ThemeToggle";
import { getStudents, addStudent, removeStudent, getGroups } from "../api/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [newStudentName, setNewStudentName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStudents();
    fetchGroups();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await getStudents();
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await getGroups();
      setGroups(res.data);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudentName) return;
    try {
      await addStudent(newStudentName); // backend may need an ID or payload; adjust as needed
      setNewStudentName("");
      fetchStudents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveStudent = async (id) => {
    if (!window.confirm("Remove this student?")) return;
    try {
      await removeStudent(id);
      fetchStudents();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          Students Management
        </h1>
        <ThemeToggle />
      </div>

      {/* Add Student */}
      <div className="flex mb-6 space-x-3">
        <input
          type="text"
          placeholder="New student name"
          className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 flex-1 focus:outline-none focus:ring focus:ring-purple-500"
          value={newStudentName}
          onChange={(e) => setNewStudentName(e.target.value)}
        />
        <button
          onClick={handleAddStudent}
          className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
        >
          Add
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
            <Bar dataKey="students" fill="#7c3aed" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search students..."
          className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 w-full focus:outline-none focus:ring focus:ring-purple-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          All Students
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-700 dark:text-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Groups</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr
                  key={s._id}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="px-4 py-2">{s.name}</td>
                  <td className="px-4 py-2">{s.email}</td>
                  <td className="px-4 py-2">
                    {s.groups?.map((g) => g.name).join(", ") || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleRemoveStudent(s._id)}
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

export default Students;
