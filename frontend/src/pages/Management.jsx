import { useEffect, useState } from "react";
import ThemeToggle from "../components/ThemeToggle";
import { LogOut, Ban, UserPlus, Users, Shield } from "lucide-react";
import {
  group as getGroup,
  blockStudent,
  addStudentToGroup,
  logout,
} from "../api/api";
import { useNavigate } from "react-router-dom";

const Management = () => {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getGroup();
        setGroup(res.data.group);
      } catch (err) {
        console.error("Failed to load group:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBlock = async (studentId) => {
    try {
      await blockStudent(studentId);
      setGroup((prev) => ({
        ...prev,
        students: prev.students.map((s) =>
          s._id === studentId ? { ...s, blocked: true } : s
        ),
      }));
    } catch (err) {
      console.error("Block failed:", err);
    }
  };

  const handleAddBack = async (studentId) => {
    try {
      await addStudentToGroup(studentId);
      setGroup((prev) => ({
        ...prev,
        students: prev.students.map((s) =>
          s._id === studentId ? { ...s, blocked: false } : s
        ),
      }));
    } catch (err) {
      console.error("Add back failed:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-950 bg-gray-100">
        {" "}
        <div className="text-lg text-gray-600 dark:text-gray-300 animate-pulse">
          Loading group details...{" "}
        </div>{" "}
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-950 bg-gray-100">
        {" "}
        <div className="text-lg text-red-500">No group data found.</div>{" "}
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-6 bg-gradient-to-b from-purple-300 via-purple-400 to-purple-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Header */}{" "}
      <div className="flex justify-between items-center mb-8">
        {" "}
        <h1 className="text-3xl font-semibold flex items-center gap-2">
          {" "}
          <Shield className="w-7 h-7 text-purple-700 dark:text-purple-400" />
          Management Panel{" "}
        </h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
      {/* Group Info */}
      <div className="p-6 rounded-xl shadow-md bg-white/30 dark:bg-gray-800/60 backdrop-blur-md mb-8 border border-white/20 dark:border-gray-700/40">
        <div className="flex justify-between flex-wrap gap-4 items-center mb-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            {group.name}
          </h2>
          <p className="text-gray-700 dark:text-gray-400">
            {group.description}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-3 rounded-md bg-purple-500/20 dark:bg-purple-400/10">
            <span className="block text-gray-700 dark:text-gray-300">
              Teacher
            </span>
            <span className="font-semibold">{group.teacher?.name}</span>
          </div>
          <div className="p-3 rounded-md bg-blue-500/20 dark:bg-blue-400/10">
            <span className="block text-gray-700 dark:text-gray-300">
              Total Students
            </span>
            <span className="font-semibold">{group.students?.length || 0}</span>
          </div>
          <div className="p-3 rounded-md bg-green-500/20 dark:bg-green-400/10">
            <span className="block text-gray-700 dark:text-gray-300">
              Active
            </span>
            <span className="font-semibold">
              {group.students?.filter((s) => !s.blocked).length || 0}
            </span>
          </div>
          <div className="p-3 rounded-md bg-red-500/20 dark:bg-red-400/10">
            <span className="block text-gray-700 dark:text-gray-300">
              Blocked
            </span>
            <span className="font-semibold">
              {group.students?.filter((s) => s.blocked).length || 0}
            </span>
          </div>
        </div>
      </div>
      {/* Student List */}
      <div className="overflow-x-auto rounded-xl shadow-md bg-white/40 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/40">
        <table className="w-full text-sm">
          <thead className="bg-white/60 dark:bg-gray-900/60 border-b border-gray-300/30 dark:border-gray-700/50">
            <tr className="text-left text-gray-800 dark:text-gray-200">
              <th className="py-3 px-4">Avatar</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {group.students?.map((student) => (
              <tr
                key={student._id}
                className="border-t border-gray-300/20 dark:border-gray-700/50 hover:bg-white/50 dark:hover:bg-gray-700/50 transition"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-500/70 dark:bg-purple-600/50 flex items-center justify-center text-white text-sm font-semibold">
                      {student.name?.[0]?.toUpperCase()}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">{student.name}</td>
                <td className="py-3 px-4">{student.email}</td>
                <td className="py-3 px-4">
                  {student.blocked ? (
                    <span className="text-red-500 font-medium">Blocked</span>
                  ) : (
                    <span className="text-green-500 font-medium">Active</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  {student.blocked ? (
                    <button
                      onClick={() => handleAddBack(student._id)}
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md text-sm transition"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add Back
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBlock(student._id)}
                      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm transition"
                    >
                      <Ban className="w-4 h-4" />
                      Block
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Management;
