// LiveClassPage.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-tomorrow_night";
import "ace-builds/src-noconflict/ext-language_tools";

import {
  Mic,
  MicOff,
  Play,
  Save,
  PhoneOff,
  Settings as SettingsIcon,
  Power,
} from "lucide-react";

import {
  enterClass,
  saveClassActivity,
  leaveClass,
  endClass,
  removeStudent,
  executeCode,
} from "../api/api";

/**
 * LiveClassPage
 * - Uses Ace editor on left (3fr) and a LiveGrid placeholder on right (1fr)
 * - Autosaves code to saveClassActivity(classId, { code })
 * - Calls enterClass(classId) on mount and leaveClass(classId) on unmount
 * - Runs code via executeCode({ code, language, stdin })
 *
 * Notes:
 * - Backend payloads: executeCode expects { code, language, stdin } — adjust if your API differs.
 * - Teacher status: determined from enterClass response if available (res.data.isTeacher). Fallback false.
 */
export default function LiveClassPage() {
  const { id: classId } = useParams(); // route: /class/:id
  const navigate = useNavigate();

  // Editor + execution state
  const [code, setCode] = useState(`// Write your code here\nconsole.log("Hello, Class!");`);
  const [language, setLanguage] = useState("javascript"); // change if you support others
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("");
  const [isOutputOpen, setIsOutputOpen] = useState(false);
  const [running, setRunning] = useState(false);

  // Session state
  const [isMuted, setIsMuted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);

  // Autosave debounce
  const autosaveTimer = useRef(null);
  const mountedRef = useRef(false);

  // Join class on mount
  useEffect(() => {
    let cancelled = false;
    mountedRef.current = true;
    async function join() {
      try {
        setLoading(true);
        const res = await enterClass(classId);
        // If backend returns last saved code or role, pick it up
        if (!cancelled && res?.data) {
          if (res.data.lastCode) setCode(res.data.lastCode);
          if (typeof res.data.isTeacher === "boolean") setIsTeacher(res.data.isTeacher);
        }
      } catch (err) {
        console.error("enterClass failed", err);
        // optionally show toast / message
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    join();

    // leave on unload or unmount
    const handleBeforeUnload = async () => {
      try {
        // synchronous attempt to notify server (best-effort)
        await leaveClass(classId);
      } catch {
        // ignore
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      cancelled = true;
      mountedRef.current = false;
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // ensure we call leaveClass on unmount
      leaveClass(classId).catch(() => {});
    };
  }, [classId]);

  // Autosave logic (debounced). Saves code to server as activity.
  const scheduleAutosave = useCallback(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        await saveClassActivity(classId, { code });
      } catch (err) {
        console.error("Autosave failed", err);
      } finally {
        setSaving(false);
      }
    }, 2000); // 2s debounce
  }, [classId, code]);

  // call scheduleAutosave whenever code changes
  useEffect(() => {
    if (!mountedRef.current) return;
    scheduleAutosave();
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [code, scheduleAutosave]);

  // Manual save (button)
  const handleSave = async () => {
    setSaving(true);
    try {
      await saveClassActivity(classId, { code });
    } catch (err) {
      console.error("Manual save failed", err);
    } finally {
      setSaving(false);
    }
  };

  // Run code via backend judge (executeCode)
  const handleRun = async () => {
    setRunning(true);
    setOutput("");
    setIsOutputOpen(true);
    try {
      // payload: adjust shape if your backend differs
      const payload = { code, language, stdin };
      const res = await executeCode(payload);
      // expect res.data.output or res.data.result
      const out = res?.data?.output ?? res?.data?.result ?? JSON.stringify(res?.data) ?? "No output";
      setOutput(String(out));
    } catch (err) {
      console.error("Code execution failed", err);
      setOutput("Execution failed. Check console for details.");
    } finally {
      setRunning(false);
    }
  };

  // Leave class
  const handleLeave = async () => {
    try {
      await leaveClass(classId);
    } catch (err) {
      console.error("leaveClass failed", err);
    } finally {
      navigate(-1); // go back
    }
  };

  // End class (teacher only)
  const handleEndClass = async () => {
    if (!window.confirm("End class for everyone? This will force everyone to leave.")) return;
    try {
      await endClass(classId);
      // optionally notify or navigate
      navigate("/"); // send to home
    } catch (err) {
      console.error("endClass failed", err);
    }
  };

  // Simple placeholder LiveGrid for participants / user's camera
  function LiveGrid() {
    return (
      <div className="h-full p-4 flex flex-col gap-3">
        <div className="flex-1 rounded-lg bg-gray-800/60 dark:bg-black/60 border border-gray-700 flex items-center justify-center text-gray-200">
          {/* Placeholder for your video tiles / user */}
          <div className="text-center">
            <div className="w-28 h-28 rounded-full bg-gray-700 mb-3 mx-auto flex items-center justify-center text-2xl">U</div>
            <div className="font-medium">You</div>
            <div className="text-sm text-gray-400">(Camera placeholder)</div>
          </div>
        </div>

        {/* Example smaller tile list (other participants) */}
        <div className="grid grid-cols-2 gap-2">
          <div className="h-20 rounded-md bg-gray-800/50 border border-gray-700 flex items-center justify-center text-gray-300">P1</div>
          <div className="h-20 rounded-md bg-gray-800/50 border border-gray-700 flex items-center justify-center text-gray-300">P2</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div>Joining class...</div>
      </div>
    );
  }

  return (
    <div className="h-screen grid grid-cols-[3fr_1fr] bg-gray-50 dark:bg-gray-900">
      {/* Left: Editor + controls */}
      <div className="flex flex-col">
        {/* Editor header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Live Class — Code Editor</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">Class: {classId}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500 dark:text-gray-400">Autosave: {saving ? "Saving..." : "Idle"}</div>
            <button onClick={handleSave} title="Save" className="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <Save className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ace Editor */}
        <div className="flex-1">
          <AceEditor
            mode={language}
            theme="tomorrow_night"
            name="live_class_ace"
            onChange={(val) => setCode(val)}
            value={code}
            width="100%"
            height="100%"
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: true,
              showLineNumbers: true,
              tabSize: 2,
            }}
            style={{ minHeight: 0 }} // so flex works properly
          />
        </div>
      </div>

      {/* Right: Live Grid */}
      <aside className="border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <LiveGrid />
      </aside>

      {/* Bottom toolbar (fixed within the page, visually over the layout) */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-full px-4 py-2 shadow-lg">
        <button
          title={isMuted ? "Unmute" : "Mute"}
          onClick={() => setIsMuted((s) => !s)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <button
          onClick={handleRun}
          disabled={running}
          title="Run code"
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <Play className="w-5 h-5" />
        </button>

        <button onClick={() => setIsOutputOpen(true)} title="Open output" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6M9 13h6" />
          </svg>
        </button>

        <button onClick={handleSave} title="Save" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <Save className="w-5 h-5" />
        </button>

        <button onClick={handleLeave} title="Leave class" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <PhoneOff className="w-5 h-5" />
        </button>

        <button title="Settings" onClick={() => alert("Settings placeholder")} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <SettingsIcon className="w-5 h-5" />
        </button>

        {isTeacher && (
          <button onClick={handleEndClass} title="End class for everyone" className="p-2 rounded-full hover:bg-red-600/10 transition text-red-600">
            <Power className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Output modal (popup) */}
      {isOutputOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/40"
          onClick={() => {
            setIsOutputOpen(false);
          }}
        >
          <div
            className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Program Output</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setOutput("");
                    setStdin("");
                  }}
                  className="px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Clear
                </button>
                <button onClick={() => setIsOutputOpen(false)} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded">Close</button>
              </div>
            </div>

            {/* stdin input */}
            <div className="mb-3">
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Input (stdin)</label>
              <textarea
                rows={3}
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                className="w-full rounded border border-gray-200 dark:border-gray-700 p-2 bg-transparent text-sm"
                placeholder="Provide input for the program (optional)"
              />
            </div>

            <div className="mb-3 flex gap-2">
              <button
                onClick={handleRun}
                disabled={running}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                {running ? "Running..." : "Run with input"}
              </button>
              <button
                onClick={() => {
                  // copy output
                  navigator.clipboard?.writeText(output || "");
                }}
                className="px-4 py-2 border rounded"
              >
                Copy output
              </button>
            </div>

            <div className="bg-black/90 dark:bg-black/95 rounded p-3 text-sm text-white overflow-auto max-h-64">
              <pre className="whitespace-pre-wrap">{output || "(no output yet)"}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
