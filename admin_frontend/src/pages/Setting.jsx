import { useEffect, useState } from "react";
import ThemeToggle from "../Components/ThemeToggle";
import { 
  getTeachers,  verifyTeacher, ignoreTeacher, 
  getStudents,  
  getGroups, createGroup, removeGroup 
} from "../api/api";

const Settings = () => {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  console.log(students)

  useEffect(() => {
    const fetchData = async () => {
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
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleVerifyTeacher = async (id) => {
    await verifyTeacher(id);
    setTeachers((prev) => prev.map(t => t._id === id ? {...t, verified: true} : t));
  };

  const handleIgnoreTeacher = async (id) => {
    await ignoreTeacher(id);
    setTeachers((prev) => prev.filter(t => t._id !== id));
  };

  const handleAddGroup = async () => {
    if (!newGroupName) return;
    const res = await createGroup({ name: newGroupName });
    setGroups((prev) => [...prev, res.data]);
    setNewGroupName("");
  };

  const handleRemoveGroup = async (id) => {
    await removeGroup(id);
    setGroups((prev) => prev.filter(g => g._id !== id));
  };

  return (
    <div className="flex-1 p-6 bg-gray-100 dark:bg-gray-900 transition-colors duration-300 min-h-screen">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <ThemeToggle />
      </div>

      {/* Teachers Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Manage Teachers
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700 dark:text-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Verified</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map(t => (
                <tr key={t._id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2">{t.name}</td>
                  <td className="px-4 py-2">{t.email}</td>
                  <td className="px-4 py-2">{t.verified ? "Yes" : "No"}</td>
                  <td className="px-4 py-2 space-x-2">
                    {!t.verified && (
                      <>
                        <button
                          onClick={() => handleVerifyTeacher(t._id)}
                          className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => handleIgnoreTeacher(t._id)}
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Ignore
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Groups Management */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Manage Groups
        </h2>
        <div className="flex mb-4 space-x-2">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="New Group Name"
            className="flex-1 px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            onClick={handleAddGroup}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Add
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700 dark:text-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">Group Name</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.map(g => (
                <tr key={g._id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2">{g.name}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleRemoveGroup(g._id)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
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

      {/* Students / Remarks management can be added similarly */}
    </div>
  );
};

export default Settings;
