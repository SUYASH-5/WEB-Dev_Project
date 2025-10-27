import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AceEditor from "react-ace";
import { getClassById, updateClassCode, executeCode } from "../api/api";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  User,
  Users,
  Calendar,
  LogOut,
  Download,
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/UseAuth";
import toast, { Toaster } from "react-hot-toast";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/ext-language_tools";

const NotesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [running, setRunning] = useState(false);

  const languages = [
    { label: "JavaScript", value: "javascript", id: 63 },
    { label: "Python", value: "python3", id: 71 },
    { label: "C++", value: "cpp", id: 54 },
  ];

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await getClassById(id);
        setClassData(res.data.class);
        setCode(res.data.class.code || "");
      } catch (err) {
        console.error("Failed to fetch class data:", err);
        toast.error("Failed to load class data");
      } finally {
        setLoading(false);
      }
    };
    fetchClass();
  }, [id]);

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    navigate("/login");
  };

  const handleRun = async () => {
    if (!code.trim()) return toast.error("Code is empty!");

    setRunning(true);
    setOutput("");
    try {
      const selectedLang = languages.find((l) => l.value === language);
      if (!selectedLang) return;

      const res = await executeCode({
        code,
        language_id: selectedLang.id,
        input,
      });

      const data = res.data;
      const outputText =
        data.stdout ?? data.stderr ?? data.compile_output ?? "No output";

      setOutput(outputText);

      if (data.stderr || data.compile_output) toast.error(outputText);
    } catch (err) {
      console.error(err);
      setOutput("Execution failed. Check your code or input.");
      toast.error("Execution failed! Check your code or input.");
    } finally {
      setRunning(false);
    }
  };

  const handleClear = () => {
    setCode("");
    setInput("");
    setOutput("");
    toast("Code cleared!");
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${classData.title || "code"}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  const handleSave = async () => {
    if (!user || user.role !== "teacher") return;
    try {
      await updateClassCode(id, { code });
      toast.success("Code saved successfully!");
    } catch (err) {
      console.error("Failed to save code:", err);
      toast.error("Failed to save code!");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    );
  if (!classData)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 dark:text-gray-400">
        Class not found.
      </div>
    );

  const { title, description, group, teacher, capacity, students, startTime, endTime, createdAt, updatedAt } = classData;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <Toaster position="top-right" reverseOrder={false} />
      {/* Navbar */}
      <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/60 backdrop-blur-md sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-500 transition"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center flex-1">
          {title}
        </h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg shadow-md transition"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Class Details - Left */}
        <div className="lg:col-span-1 bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md sticky top-20">
          <h2 className="text-2xl font-bold flex items-center gap-4 mb-5">
            <BookOpen size={20} className="text-purple-500" /> Class Details
          </h2>
          <p className="text-gray-700 dark:text-gray-200 mb-6">{description}</p>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <User size={16} /> Teacher: <span className="text-gray-800 dark:text-gray-100">{teacher?.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <Users size={16} /> Students Attended: <span className="text-gray-800 dark:text-gray-100">{students?.length || 0}/{capacity}</span>
            </div>
            <div className="flex items-center gap-4">
              <Calendar size={16} /> Group: <span className="text-gray-800 dark:text-gray-100">{group?.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <Clock size={16} /> Start: <span className="text-gray-800 dark:text-gray-100">{startTime ? new Date(startTime).toLocaleString() : "N/A"}</span>
            </div>
            <div className="flex items-center gap-4">
              <Clock size={16} /> End: <span className="text-gray-800 dark:text-gray-100">{endTime ? new Date(endTime).toLocaleString() : "N/A"}</span>
            </div>
            <div className="flex items-center gap-4">
              <Clock size={16} /> Created: <span className="text-gray-800 dark:text-gray-100">{new Date(createdAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-4">
              <Clock size={16} /> Last Updated: <span className="text-gray-800 dark:text-gray-100">{new Date(updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Code Editor Section - Right */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <h2 className="text-xl font-semibold flex items-center gap-2 border-b border-gray-300 dark:border-gray-700 pb-2">
              <BookOpen size={18} className="text-blue-500" /> Class Code
            </h2>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 text-sm"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>

          <AceEditor
            mode={
              language === "javascript"
                ? "javascript"
                : language === "python3"
                ? "python"
                : "c_cpp"
            }
            theme="dracula"
            value={code}
            onChange={setCode}
            name="classCodeEditor"
            fontSize={16}
            width="100%"
            height="400px"
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: true,
              showLineNumbers: true,
              tabSize: 2,
            }}
          />

          <div className="flex flex-col md:flex-row gap-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Input"
              className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 resize-none"
              rows={4}
            />
            <textarea
              value={output}
              readOnly
              placeholder="Output"
              className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 resize-none"
              rows={4}
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleRun}
              disabled={running}
              className={`px-4 py-2 ${
                running
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              } text-white rounded-lg transition`}
            >
              {running ? "Running..." : "Run"}
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
            >
              Clear
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-1 transition"
            >
              <Download size={16} /> Download Notes
            </button>
            {user?.role === "teacher" && (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition"
              >
                Save Code
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesPage;
