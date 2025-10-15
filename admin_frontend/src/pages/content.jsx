import { useEffect, useState } from "react";
import ThemeToggle from "../Components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import {
  getTeachers,
  getPendingRequests,
  getStudents,
  getGroups,
  logout
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
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    verifiedTeachers: 0,
    pendingRequests: 0,
    students: 0,
    classes: 0,
  });

  const [classesOverview, setClassesOverview] = useState([]);
  const [pendingTeachers, setPendingTeachers] = useState([]);
  
  const mapGroupsWithTeachers = (groups, teachers) => {
    return groups.map((g) => {
      const teacherObj = teachers.find((t) => t._id === g.teacher) || null;
      return {
        ...g,
        teacher: teacherObj,
      };
    });
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [teachersRes, pendingRes, studentsRes, groupsRes] =
          await Promise.all([
            getTeachers(),
            getPendingRequests(),
            getStudents(),
            getGroups(),
          ]);

        const teachers = teachersRes.data.teachers || [];
        const pending = pendingRes.data.requests || [];
        const students = studentsRes.data.students || [];
        const groups = mapGroupsWithTeachers(groupsRes.data.groups || [], teachers);

        const verifiedTeachersCount = teachers.filter((t) => t.ValidityState === "valid").length;

        setStats({
          verifiedTeachers: verifiedTeachersCount,
          pendingRequests: pending.length,
          students: students.length,
          classes: groups.length,
        });

        setClassesOverview(groups);
        setPendingTeachers(pending);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    await Promise.all([
      logout(),
      navigate('/')
    ])
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
    <div className="flex-1 p-6 bg-gradient-to-br from-[#f9f9fb] via-[#f4f3ff] to-[#ebe9ff] dark:from-[#0f0c29] dark:via-[#302b63] dark:to-[#24243e] min-h-screen text-gray-900 dark:text-gray-100 relative rounded-2xl">
      {/* Neon blur background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-500/10 dark:from-purple-700/10 dark:to-pink-700/10 blur-3xl -z-10" />

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100">
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/70 dark:bg-white/10 backdrop-blur-md rounded-xl shadow-inner p-6">
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
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "rgba(255,255,255,0.9)", borderRadius: "8px", color: "#111" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/70 dark:bg-white/10 backdrop-blur-md rounded-xl shadow-inner p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Students per Class
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={studentsPerClass}>
              <XAxis dataKey="name" stroke="#a78bfa" />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: "rgba(255,255,255,0.9)", borderRadius: "8px", color: "#111" }} />
              <Legend />
              <Bar dataKey="students" fill="#7c3aed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classes Table */}
        <div className="bg-white/70 dark:bg-white/10 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Classes Overview
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700 dark:text-gray-200">
              <thead className="bg-white/50 dark:bg-white/5 border-b border-gray-300 dark:border-white/10 uppercase">
                <tr>
                  <th className="px-4 py-2">Class Name</th>
                  <th className="px-4 py-2">Students</th>
                  <th className="px-4 py-2">Teacher</th>
                </tr>
              </thead>
              <tbody>
                {classesOverview.map((cls) => (
                  <tr key={cls._id} className="border-t border-gray-200 dark:border-white/10 hover:bg-white/50 dark:hover:bg-white/5 transition-all">
                    <td className="px-4 py-2">{cls.name}</td>
                    <td className="px-4 py-2">{cls.students?.length || 0}</td>
                    <td className="px-4 py-2">{cls.teacher?.name || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Teachers Table */}
        <div className="bg-white/70 dark:bg-white/10 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Pending Teacher Requests
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700 dark:text-gray-200">
              <thead className="bg-white/50 dark:bg-white/5 border-b border-gray-300 dark:border-white/10 uppercase">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Applied On</th>
                </tr>
              </thead>
              <tbody>
                {pendingTeachers.map((teacher) => (
                  <tr key={teacher._id} className="border-t border-gray-200 dark:border-white/10 hover:bg-white/50 dark:hover:bg-white/5 transition-all">
                    <td className="px-4 py-2">{teacher.name}</td>
                    <td className="px-4 py-2">{teacher.email}</td>
                    <td className="px-4 py-2">{new Date(teacher.createdAt).toLocaleDateString()}</td>
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
