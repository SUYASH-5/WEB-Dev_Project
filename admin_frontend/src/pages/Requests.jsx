import { useEffect, useState } from "react";
import ThemeToggle from "../Components/ThemeToggle";
import { getTeachers, getStudents, getGroups } from "../api/api";

const Requests = () => {
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
        setTeachers(tRes.data);
        setStudents(sRes.data);
        setGroups(gRes.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };
    fetchReports();
  }, []);

  // Example: generate some aggregated stats
  const verifiedTeachers = teachers.filter((t) => t.verified).length;
  const totalStudents = students.length;
  const totalClasses = groups.length;

  return (
    <div className="flex-1 p-6 bg-gray-100 dark:bg-gray-900 transition-colors duration-300 min-h-screen">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Reports
        </h1>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Verified Teachers
          </h3>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {verifiedTeachers}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Students
          </h3>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {totalStudents}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Classes
          </h3>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {totalClasses}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Pending Requests
          </h3>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {teachers.filter((t) => !t.verified).length}
          </p>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teachers Table */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            All Teachers
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700 dark:text-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Verified</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t._id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-2">{t.name}</td>
                    <td className="px-4 py-2">{t.email}</td>
                    <td className="px-4 py-2">{t.verified ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            All Students
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700 dark:text-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Class</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-2">{s.name}</td>
                    <td className="px-4 py-2">{s.email}</td>
                    <td className="px-4 py-2">{s.class?.name || "N/A"}</td>
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
