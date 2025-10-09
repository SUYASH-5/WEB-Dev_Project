import { useEffect, useState } from "react";
import ThemeToggle from "../Components/ThemeToggle";
import {
  getTeachers,
  getPendingRequests,
  getStudents,
  getGroups,
} from "../api/api";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#7c3aed", "#d8b4fe", "#c084fc", "#a78bfa"];

const Content = () => {
  const [stats, setStats] = useState({
    verifiedTeachers: 0,
    pendingRequests: 0,
    students: 0,
    classes: 0,
  });

  const [classesOverview, setClassesOverview] = useState([]);
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [teachersData, setTeachersData] = useState([]);
  const [studentsData, setStudentsData] = useState([]);
  console.log("Teachers Data:", teachersData);
  console.log("Students Data:", studentsData);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // ✅ Use the imported API functions
        const [teachersRes, pendingRes, studentsRes, groupsRes] =
          await Promise.all([
            getTeachers(),
            getPendingRequests(),
            getStudents(),
            getGroups(),
          ]);

        const teachers = teachersRes.data || [];
        const pending = pendingRes.data || [];
        const students = studentsRes.data || [];
        const groups = groupsRes.data || [];

        const verifiedTeachersCount = teachers.filter((t) => t.verified).length;

        setStats({
          verifiedTeachers: verifiedTeachersCount,
          pendingRequests: pending.length,
          students: students.length,
          classes: groups.length,
        });

        setClassesOverview(groups);
        setPendingTeachers(pending);
        setTeachersData(teachers);
        setStudentsData(students);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const teacherPieData = [
    { name: "Verified", value: stats.verifiedTeachers },
    { name: "Pending", value: stats.pendingRequests },
  ];

  const studentsPerClass = classesOverview.map((cls) => ({
    name: cls.name,
    students: cls.students?.length || 0,
  }));

  return (
    <div className="flex-1 p-6 bg-[#f5f3ff] dark:bg-[#1e1b4b] transition-colors duration-300 min-h-screen">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-md hover:opacity-90 transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Verified Teachers", value: stats.verifiedTeachers },
          { title: "Pending Requests", value: stats.pendingRequests },
          { title: "Students", value: stats.students },
          { title: "Classes", value: stats.classes },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-white dark:bg-indigo-950 shadow-lg rounded-xl p-5 hover:shadow-xl transition-all"
          >
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {card.title}
            </h3>
            <p className="mt-2 text-3xl font-bold text-purple-700 dark:text-violet-300">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-indigo-950 shadow-lg rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Teachers Overview
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

        <div className="bg-white dark:bg-indigo-950 shadow-lg rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Students per Class
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={studentsPerClass}>
              <XAxis dataKey="name" stroke="#a78bfa" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="students" fill="#7c3aed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classes Overview Table */}
        <div className="bg-white dark:bg-indigo-950 shadow-lg rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Classes Overview
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700 dark:text-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2">Class Name</th>
                  <th className="px-4 py-2">Students</th>
                  <th className="px-4 py-2">Teacher</th>
                </tr>
              </thead>
              <tbody>
                {classesOverview.map((cls) => (
                  <tr
                    key={cls._id}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <td className="px-4 py-2">{cls.name}</td>
                    <td className="px-4 py-2">{cls.students?.length || 0}</td>
                    <td className="px-4 py-2">
                      {cls.teacher?.name || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Teachers Table */}
        <div className="bg-white dark:bg-indigo-950 shadow-lg rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Pending Teacher Requests
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700 dark:text-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Applied On</th>
                </tr>
              </thead>
              <tbody>
                {pendingTeachers.map((teacher) => (
                  <tr
                    key={teacher._id}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <td className="px-4 py-2">{teacher.name}</td>
                    <td className="px-4 py-2">{teacher.email}</td>
                    <td className="px-4 py-2">
                      {new Date(teacher.createdAt).toLocaleDateString()}
                    </td>
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

export default Content;
