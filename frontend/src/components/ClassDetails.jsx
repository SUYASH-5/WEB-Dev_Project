import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getClassById } from "../api/api";
import {
  X,
  Calendar,
  Clock,
  Users,
  BookOpen,
  User,
  ShieldAlert,
  Info,
} from "lucide-react";
import gsap from "gsap";
import ClassButtons from "./ClassButton";
import { useAuth } from "../context/UseAuth";

const statusStyles = {
  upcoming: "bg-blue-500/20 text-blue-400 border border-blue-400/40",
  Started: "bg-green-500/20 text-green-400 border border-green-400/40",
  ended: "bg-gray-500/20 text-gray-400 border border-gray-400/40",
};

const ClassDetails = ({ isOpen, onClose, classId , onClassDeleted }) => {
  const { user } = useAuth();
  const [classDetails, setClassDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen && classId) fetchClassDetails(classId);
  }, [isOpen, classId]);

  const fetchClassDetails = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getClassById(id);
      if (response.status === 200) setClassDetails(response.data.class);
      else setError("Failed to fetch class details");
    } catch (err) {
      console.error("Error fetching class details:", err);
      setError("Error fetching class details");
    } finally {
      setLoading(false);
    }
  };

  useLayoutEffect(() => {
    if (!isOpen) return;
    gsap.to(overlayRef.current, {
      opacity: 1,
      duration: 0.4,
      ease: "power2.out",
    });
    gsap.fromTo(
      modalRef.current,
      { y: 80, opacity: 0, scale: 0.92, rotateX: 10 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        rotateX: 0,
        duration: 0.55,
        ease: "back.out(1.7)",
      }
    );
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/40 backdrop-blur-md opacity-0 transition-opacity"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl p-8 rounded-2xl
                   bg-white/85 dark:bg-gray-900/85 backdrop-blur-xl
                   shadow-[0_8px_40px_rgba(0,0,0,0.25)]
                   border border-gray-200/50 dark:border-gray-700/50
                   text-gray-900 dark:text-gray-100 overflow-y-auto max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <h2 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-purple-600 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
          Class Overview
        </h2>

        {/* Loading & Error States */}
        {loading && (
          <p className="text-center text-gray-500 dark:text-gray-400 animate-pulse">
            Loading class details...
          </p>
        )}
        {error && <p className="text-center text-red-500">{error}</p>}

        {/* Content */}
        {classDetails && (
          <div className="space-y-6">
            {/* Title + Status */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-2xl font-semibold">{classDetails.title}</h3>
              <span
                className={`px-3 py-1 text-sm rounded-full font-medium ${
                  statusStyles[classDetails.status]
                }`}
              >
                {classDetails.status.toUpperCase()}
              </span>
            </div>

            {/* Description */}
            <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl border border-gray-200/40 dark:border-gray-700/40">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {classDetails.description || "No description provided."}
              </p>
            </div>

            {/* Core Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <InfoCard
                icon={<Calendar className="text-purple-400" size={18} />}
                label="Start Time"
                value={new Date(classDetails.startTime).toLocaleString()}
              />
              <InfoCard
                icon={<Clock className="text-cyan-400" size={18} />}
                label="End Time"
                value={
                  classDetails.endTime
                    ? new Date(classDetails.endTime).toLocaleString()
                    : "Not Ended Yet"
                }
              />
              <InfoCard
                icon={<Users className="text-emerald-400" size={18} />}
                label="Capacity"
                value={classDetails.capacity}
              />
              <InfoCard
                icon={<BookOpen className="text-pink-400" size={18} />}
                label="Group"
                value={classDetails.group?.name || "N/A"}
              />
              <InfoCard
                icon={<User className="text-orange-400" size={18} />}
                label="Teacher"
                value={`${classDetails.teacher?.name || "N/A"} (${
                  classDetails.teacher?.email || ""
                })`}
              />
              <InfoCard
                icon={<ShieldAlert className="text-red-400" size={18} />}
                label="Blocked Students"
                value={`${classDetails.blocked?.length || 0}`}
              />
            </div>

            {/* Student Attendance Section */}
            <div>
              <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Users size={18} className="text-cyan-400" /> Students
                Attendance
              </h4>

              {classDetails.students && classDetails.students.length > 0 ? (
                <div className="overflow-y-auto max-h-60 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300">
                      <tr>
                        <th className="p-3">Name</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Attendance</th>
                        <th className="p-3">Periods</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classDetails.students.map((stu) => (
                          <tr
                          key={
                            stu.student?.id ||
                            stu.id ||
                            stu.student?.email ||
                            `${stu.student?.name || "unknown"}-${stu.attended ? "present" : "absent"}-${stu.period?.length || 0}`
                          }
                          className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <td className="p-3">
                            {stu.student?.name || "Unknown"}
                          </td>
                          <td className="p-3">{stu.student?.email || "-"}</td>
                          <td
                            className={`p-3 font-semibold ${
                              stu.attended ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            {stu.attended ? "Present" : "Absent"}
                          </td>
                          <td className="p-3">
                            {stu.period && stu.period.length > 0 ? (
                              <ul className="list-disc ml-4 space-y-1">
                                {stu.period.map((p) => (
                                  <li
                                    key={p.id || `${p.startTime}-${p.endTime}`}
                                    className="text-xs text-gray-500 dark:text-gray-400"
                                  >
                                    {new Date(p.startTime).toLocaleTimeString()}{" "}
                                    - {new Date(p.endTime).toLocaleTimeString()}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  No student data available.
                </p>
              )}
            </div>

            {/* Remarks */}
            {classDetails.remarks && (
              <div className="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200/30 dark:border-gray-700/30">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Remarks:</span>{" "}
                  {classDetails.remarks}
                </p>
              </div>
            )}

            {/* Buttons Section */}
          </div>
        )}
        <ClassButtons classDetails={classDetails} user={user} onClose={onClose} onClassDeleted={onClassDeleted} />
      </div>
    </div>
  );
};

// Small info card component for reusable grid items
const InfoCard = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg border border-gray-200/40 dark:border-gray-700/40">
    {icon}
    <div>
      <p className="font-semibold">{label}</p>
      <p className="text-gray-600 dark:text-gray-400 break-words">{value}</p>
    </div>
  </div>
);

export default ClassDetails;
