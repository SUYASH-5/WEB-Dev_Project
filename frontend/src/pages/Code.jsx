// DevStudioProV10.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import AceEditor from "react-ace";
import ThemeToggle from "../components/ThemeToggle";
import { executeCode, logout } from "../api/api";
import { Play, Copy, DownloadCloud, Trash2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Ace imports
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/ext-language_tools";

/*
 DevStudioProV10 (optimized)
 - Keyboard shortcuts removed (per request)
 - pushHistory uses functional update (no stale closure)
 - handleRun wrapped in useCallback
 - General small readability/robustness improvements
*/

const languageMap = { javascript: 63, python: 71, cpp: 54, c: 50 };

const placeholders = {
  javascript: `// JavaScript (Node) — stdin via fs.readFileSync\n// Example:\n// const fs = require('fs');\n// const input = fs.readFileSync(0, 'utf8').trim();\n// console.log("Hello " + input);\n`,
  python: `# Python — use input()\n# Example:\n# name = input()\n# print("Hello", name)\n`,
  cpp: `// C++ — use cin\n// Example:\n// #include <bits/stdc++.h>\n// using namespace std;\n// int main(){string s;cin>>s;cout<<"Hello "<<s;}\n`,
  c: `// C — use scanf\n// Example:\n// #include <stdio.h>\n// int main(){char s[50];scanf("%s", s);printf("Hello %s", s);}\n`,
};

const LS_PREFIX = "devstudio_v10";
const codeKey = (lang) => `${LS_PREFIX}:code:${lang}`;
const inputKey = (lang) => `${LS_PREFIX}:input:${lang}`;
const historyKey = `${LS_PREFIX}:history`;

const STREAM_REVEAL_MS = 12;
const humanTs = (ts = Date.now()) => new Date(ts).toLocaleString();

export default function DevStudioProV10() {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(placeholders.javascript);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [stderr, setStderr] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("output");
  const [history, setHistory] = useState([]);

  const navigate = useNavigate();
  const streamTimerRef = useRef(null);
  const abortStreamRef = useRef(false);
  const outputRef = useRef(null);

  // load persisted drafts + history once
  useEffect(() => {
    try {
      const h = localStorage.getItem(historyKey);
      if (h) setHistory(JSON.parse(h));
      const savedCode = localStorage.getItem(codeKey(language));
      const savedInput = localStorage.getItem(inputKey(language));
      if (savedCode) setCode(savedCode);
      if (savedInput) setInput(savedInput);
    } catch (err) {
      // ignore localStorage errors silently (e.g. private mode)
      console.warn("DevStudio: load error", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // load draft on language change (auto)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(codeKey(language));
      const savedI = localStorage.getItem(inputKey(language));
      setCode(saved ?? placeholders[language] ?? "");
      setInput(savedI ?? "");
      setOutput("");
      setStderr("");
      setStats(null);
    } catch {
      // ignore
    }
  }, [language]);

  // autosave code & input (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(codeKey(language), code);
      } catch (err) {
        console.error("Code save error", err);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [code, language]);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(inputKey(language), input);
      } catch (err) {
        console.error("Input save error", err);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [input, language]);

  // push to history (use functional update to avoid stale closures)
  const pushHistory = useCallback((entry) => {
    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, 50);
      try {
        localStorage.setItem(historyKey, JSON.stringify(next));
      } catch (err) {
        console.error("History save error", err);
      }
      return next;
    });
  }, []);

  // streaming reveal (interruptible)
  const progressiveReveal = useCallback((text, setter) => {
    clearTimeout(streamTimerRef.current);
    abortStreamRef.current = false;
    setter("");
    let pos = 0;
    const chunk = () => {
      if (abortStreamRef.current) return;
      const take = Math.max(1, 12 + Math.floor(Math.random() * 80));
      pos = Math.min(text.length, pos + take);
      setter(text.slice(0, pos));
      if (pos < text.length) streamTimerRef.current = setTimeout(chunk, STREAM_REVEAL_MS);
    };
    chunk();
  }, []);

  const abortStreaming = useCallback(() => {
    abortStreamRef.current = true;
    clearTimeout(streamTimerRef.current);
  }, []);

  const toast = useCallback((msg) => {
    const el = document.createElement("div");
    el.innerText = msg;
    Object.assign(el.style, {
      position: "fixed",
      right: "18px",
      bottom: "18px",
      padding: "10px 14px",
      background: "rgba(8,10,12,0.86)",
      color: "white",
      borderRadius: "8px",
      zIndex: 9999,
      boxShadow: "0 6px 20px rgba(2,6,23,0.6)",
      fontSize: "13px",
    });
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  }, []);

  const downloadFile = useCallback((text, name = "output.txt") => {
    try {
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error", err);
      toast("Download failed");
    }
  }, [toast]);

  // run handler (useCallback for stability)
  const handleRun = useCallback(async () => {
    abortStreaming();
    setLoading(true);
    setOutput("");
    setStderr("");
    setStats(null);
    setActiveTab("output");

    const payload = { code, language_id: languageMap[language], input };
    const start = Date.now();
    try {
      const res = await executeCode(payload);
      const r = res.data ?? res;

      if (r.compile_output) {
        progressiveReveal(r.compile_output || "", setStderr);
        setActiveTab("errors");
      } else if (r.stderr) {
        progressiveReveal(r.stderr || "", setStderr);
        setActiveTab("errors");
      } else {
        const out = r.stdout ?? "";
        if (out.length > 0) progressiveReveal(out, setOutput);
        else setOutput(out || "");
        setActiveTab("output");
      }

      setStats({
        time: r.time ?? r.exec_time ?? 0,
        memory: r.memory ?? 0,
        status: r.status?.description ?? r.status ?? "OK",
      });

      pushHistory({
        id: Math.random().toString(36).slice(2, 9),
        ts: Date.now(),
        lang: language,
        codeSnippet: (code || "").slice(0, 800),
        input,
        output: r.stdout || "",
        stderr: r.stderr || r.compile_output || "",
        stats: { time: r.time ?? null, memory: r.memory ?? null },
      });

      const took = ((Date.now() - start) / 1000).toFixed(3);
      toast(`Run finished (${took}s)`);

      if (outputRef.current) {
        outputRef.current.classList.add("ring-2", "ring-indigo-500", "ring-opacity-30");
        setTimeout(() => outputRef.current?.classList.remove("ring-2", "ring-indigo-500", "ring-opacity-30"), 420);
      }
    } catch (err) {
      setStderr(String(err.message || err));
      setActiveTab("errors");
      toast("Execution failed");
    } finally {
      setLoading(false);
    }
  }, [code, language, input, progressiveReveal, pushHistory, toast, abortStreaming]);

  const clearConsole = useCallback(() => {
    abortStreaming();
    setOutput("");
    setStderr("");
    setStats(null);
    setActiveTab("output");
  }, [abortStreaming]);

  const removeHistoryItem = useCallback((id) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h.id !== id);
      try {
        localStorage.setItem(historyKey, JSON.stringify(next));
      } catch (err) {
        console.error("History save error", err);
      }
      return next;
    });
  }, []);

  const restoreHistoryItem = useCallback((h) => {
    setLanguage(h.lang);
    setCode(h.codeSnippet);
    setInput(h.input);
    setOutput(h.output);
    setStderr(h.stderr);
    toast("Restored snippet");
  }, [toast]);

  const copyOutput = useCallback(async () => {
    try {
      const txt = activeTab === "errors" ? stderr : activeTab === "stats" ? JSON.stringify(stats) : output;
      await navigator.clipboard.writeText(txt || "");
      toast("Copied to clipboard");
    } catch {
      toast("Copy failed");
    }
  }, [activeTab, output, stderr, stats, toast]);

  const filenameFor = useCallback((lang) => `code_${lang}_${Date.now()}.${lang === "python" ? "py" : lang === "javascript" ? "js" : lang === "cpp" ? "cpp" : "c"}`, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      toast("Logged out");
      navigate("/login");
    } catch (err) {
      toast("Logout failed");
      console.error("Logout error", err);
    }
  }, [navigate, toast]);

  // NOTE: keyboard shortcuts deliberately removed per request

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-900 dark:from-slate-950 dark:via-gray-900 dark:to-black text-gray-100">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-violet-300 to-pink-300">DevStudio Pro</h1>
            <p className="text-sm text-gray-400 mt-1">Fast runs. Clean UX. Professional toolbelt.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/6 dark:bg-white/6 border border-white/8 dark:border-gray-700 px-3 py-1.5 rounded-lg">
              <label className="text-sm opacity-85 mr-1">Lang</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-transparent text-sm px-3 py-1 outline-none">
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
              </select>
            </div>

            <ThemeToggle />

            <button onClick={handleLogout} title="Logout" className="flex items-center gap-2 px-3 py-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white shadow-md">
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>

            <div className="flex items-center gap-3">
              <button onClick={handleRun} disabled={loading} title="Run"
                className={`flex items-center gap-3 px-5 py-2 rounded-lg text-lg font-semibold transition ${loading ? "bg-violet-500/60 cursor-not-allowed" : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg"}`}>
                <Play className="w-5 h-5" />
                <span>{loading ? "Running..." : "Run"}</span>
              </button>

              <div className="rounded-lg px-2 py-1 flex items-center gap-2 text-sm">
                <button onClick={() => downloadFile(code, filenameFor(language))} className="flex items-center gap-2 px-3 py-1 rounded border border-white/12 text-sm text-gray-200 hover:bg-white/6">
                  <DownloadCloud className="w-4 h-4" /> Download
                </button>
                <button onClick={() => { navigator.clipboard?.writeText(code); toast("Copied code"); }} className="flex items-center gap-2 px-3 py-1 rounded border border-white/12 text-sm text-gray-200 hover:bg-white/6">
                  <Copy className="w-4 h-4" /> Copy
                </button>
                <button onClick={() => { setCode(placeholders[language]); toast("Reset template"); }} className="px-3 py-1 rounded border border-white/12 text-sm text-gray-200 hover:bg-white/6">
                  Reset
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main grid: equal split */}
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor (left) */}
          <section className="col-span-1 bg-white/4 dark:bg-gray-800/30 border border-white/6 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/6 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <span className="text-lg opacity-90">Editor</span>
                <span className="text-xs text-gray-300 bg-white/3 dark:bg-gray-700 px-2 py-0.5 rounded">{language.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <button className="px-3 py-1 rounded hover:bg-white/6" onClick={() => { setCode(""); toast("Cleared editor"); }}>Clear</button>
              </div>
            </div>

            <div className="p-5 flex-1 h-[72vh]">
              <AceEditor
                mode={language === "cpp" ? "c_cpp" : language}
                theme="dracula"
                value={code}
                onChange={setCode}
                name="devstudio_editor"
                fontSize={15}
                width="100%"
                height="100%"
                showPrintMargin={false}
                showGutter
                highlightActiveLine
                setOptions={{ enableBasicAutocompletion: true, enableLiveAutocompletion: true, tabSize: 2 }}
                placeholder={placeholders[language]}
              />
            </div>

            <div className="px-5 pb-5">
              <label className="block text-sm font-medium mb-2">Input (stdin)</label>
              <textarea placeholder={`Input for ${language.toUpperCase()} — ${language === "javascript" ? "use fs.readFileSync(0,'utf8')" : language === "python" ? "use input()" : "use cin/scanf"}`}
                value={input} onChange={(e) => setInput(e.target.value)} rows={3}
                className="w-full bg-black/50 dark:bg-gray-900/40 border border-white/6 dark:border-gray-700 rounded-lg p-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition" />
            </div>
          </section>

          {/* Console (right) */}
          <aside className="col-span-1 bg-black/30 dark:bg-gray-900/30 border border-white/6 dark:border-gray-700 rounded-2xl p-4 flex flex-col">
            {/* toolbar: actions (left) + segmented tabs (right) */}
            <div className="flex items-center justify-between pb-3 border-b border-white/6 dark:border-gray-700">
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={clearConsole} className="flex items-center gap-2 px-3 py-1 rounded-md text-sm border border-white/12 text-gray-200 hover:bg-white/6">
                  <Trash2 className="w-4 h-4" /> <span>Clear</span>
                </button>

                <button onClick={copyOutput} className="flex items-center gap-2 px-3 py-1 rounded-md text-sm border border-white/12 text-gray-200 hover:bg-white/6">
                  <Copy className="w-4 h-4" /> <span>Copy</span>
                </button>

                <button onClick={() => downloadFile(activeTab === "errors" ? stderr : (activeTab === "stats" ? JSON.stringify(stats, null, 2) : output) || "", `${activeTab}.txt`)}
                  className="flex items-center gap-2 px-3 py-1 rounded-md text-sm border border-white/12 text-gray-200 hover:bg-white/6">
                  <DownloadCloud className="w-4 h-4" /> <span>Download</span>
                </button>
              </div>

              <div className="flex items-center gap-1 bg-white/6 dark:bg-gray-800/20 rounded-md p-1">
                {["output", "errors", "stats"].map((t) => (
                  <button key={t} onClick={() => setActiveTab(t)}
                    className={`px-3 py-1 rounded text-sm font-medium ${activeTab === t ? "bg-indigo-600 text-white shadow-sm" : "text-gray-300 hover:bg-white/8"}`}>
                    {t === "errors" ? "Errors" : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Console Body */}
            <div className="flex-1 mt-4 overflow-auto">
              {activeTab === "output" && (
                <div className="rounded-lg bg-black/60 border border-white/8 p-4 min-h-[72vh]" ref={outputRef}>
                  {loading && !output && <div className="text-gray-300 animate-pulse">⏳ Running your code…</div>}
                  {!loading && !output && !stderr && <div className="text-gray-400 italic">Output will appear here</div>}
                  {(output || "").length > 0 && <pre className="whitespace-pre-wrap text-green-300 font-mono text-sm">{output}</pre>}
                </div>
              )}

              {activeTab === "errors" && (
                <div className="rounded-lg bg-black/60 border border-red-600/30 p-4 min-h-[72vh]">
                  {stderr ? <pre className="whitespace-pre-wrap text-red-300 font-mono text-sm">{stderr}</pre> : <div className="text-gray-400 italic">No errors.</div>}
                </div>
              )}

              {activeTab === "stats" && (
                <div className="rounded-lg bg-black/60 border border-white/8 p-4 min-h-[72vh] flex flex-col gap-3">
                  <div className="flex items-center justify-between"><span className="text-sm text-gray-300">Status</span><b>{stats?.status ?? "Idle"}</b></div>
                  <div className="flex items-center justify-between"><span className="text-sm text-gray-300">Time</span><b>{stats?.time ?? "-" } s</b></div>
                  <div className="flex items-center justify-between"><span className="text-sm text-gray-300">Memory</span><b>{stats?.memory ?? "-"} KB</b></div>
                </div>
              )}
            </div>

            {/* History */}
            <div className="mt-4 border-t border-white/6 pt-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-300">Run History</div>
                <div className="text-xs">
                  <button className="px-2 py-1" onClick={() => { setHistory([]); localStorage.removeItem(historyKey); toast("Cleared history"); }}>Clear</button>
                </div>
              </div>

              {history.length === 0 && <div className="text-gray-500 text-sm italic">No history yet — runs will appear here.</div>}
              <ul className="max-h-40 overflow-auto space-y-2 mt-2">
                {history.map((h) => (
                  <li key={h.id} className="flex items-start gap-2 bg-white/3 dark:bg-gray-800/20 p-2 rounded">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{h.lang.toUpperCase()} • {humanTs(h.ts)}</div>
                        <div className="text-xs text-gray-200">{h.stats?.time ? `${h.stats.time}s` : ""}</div>
                      </div>
                      <div className="text-xs text-gray-300 mt-1 whitespace-pre-wrap">{(h.codeSnippet || "").slice(0, 220)}{(h.codeSnippet || "").length > 220 ? "…" : ""}</div>
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        <button onClick={() => restoreHistoryItem(h)} className="px-2 py-1 rounded hover:bg-white/5">Restore</button>
                        <button onClick={() => downloadFile(h.codeSnippet || "", `history_${h.lang}_${h.ts}.txt`)} className="px-2 py-1 rounded hover:bg-white/5">Download</button>
                        <button onClick={() => removeHistoryItem(h.id)} className="px-2 py-1 rounded hover:bg-white/5">Delete</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

          </aside>
        </main>
      </div>
    </div>
  );
}
