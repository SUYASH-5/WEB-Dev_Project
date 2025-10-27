import { useEffect, useRef, useState } from "react";
import { X, Settings as SettingsIcon, User, Sun, Lock, Trash } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import gsap from "gsap";
import { updateUser, deleteUser, getProfile } from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Settings({ isOpen, onClose }) {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Fetch user profile
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    getProfile()
      .then((res) => {
        const data = res.data.userdata;
        setUserData(data);
        setProfileForm({ name: data.name || "", email: data.email || "" });
      })
      .catch(() => setMessage("Failed to load profile."))
      .finally(() => setLoading(false));
  }, [isOpen]);

  // Animations
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.28, ease: "power2.out" });
    gsap.fromTo(modalRef.current, { y: 36, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: 0.38, ease: "power3.out", delay: 0.06 });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    gsap.to(modalRef.current, { y: 20, opacity: 0, scale: 0.96, duration: 0.22, ease: "power1.in" });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.22, ease: "power1.in", onComplete: onClose });
  };

  const handleProfileSave = async () => {
    if (!userData) return;
    const { name, email } = profileForm;

    if (!name.trim() || !email.trim()) return setMessage("Name and email cannot be empty.");
    if (name === userData.name && email === userData.email) return setMessage("No changes to save.");

    setSaving(true);
    try {
      const payload = {};
      if (name !== userData.name) payload.name = name;
      if (email !== userData.email) payload.email = email;
      await updateUser(payload);
      setUserData({ ...userData, ...payload });
      setMessage("Profile updated.");
    } catch {
      setMessage("Failed to update profile.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDelete = async () => {
    if (!globalThis.confirm("Delete account permanently? This cannot be undone.")) return;
    try {
      setMessage("Deleting account...");
      await deleteUser();
      setMessage("Account deleted. Logging out...");
      setTimeout(() => navigate("/"), 1200);
    } catch {
      setMessage("Failed to delete account.");
    }
  };

  const goToChangePassword = () => navigate("/change-password");

  const sidebarOptions = [
    { id: "profile", icon: <User className="w-4 h-4" />, label: "Profile" },
    { id: "appearance", icon: <Sun className="w-4 h-4" />, label: "Appearance" },
    { id: "security", icon: <Lock className="w-4 h-4" />, label: "Security" },
    { id: "danger", icon: <Trash className="w-4 h-4 text-red-500" />, label: "Danger Zone", accent: true },
  ];

  return (
    <div
      ref={overlayRef}
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/50 backdrop-blur-md"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl text-gray-900 dark:text-gray-100 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-semibold">Settings</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage profile, appearance and security</p>
          </div>
          <button onClick={handleClose} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition" aria-label="Close settings">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-56 bg-gray-50 dark:bg-gray-800 p-4 border-r border-gray-100 dark:border-gray-800">
            <nav className="space-y-2">
              {sidebarOptions.slice(0, 3).map((opt) => (
                <SidebarButton key={opt.id} {...opt} active={activeTab === opt.id} onClick={() => setActiveTab(opt.id)} />
              ))}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                <SidebarButton {...sidebarOptions[3]} active={activeTab === "danger"} onClick={() => setActiveTab("danger")} />
              </div>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-6">
            {message && (
              <div className="mb-4 px-4 py-2 rounded-lg bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-sm font-medium">
                {message}
              </div>
            )}

            {loading ? (
              <p className="text-center text-gray-600 dark:text-gray-400">Loading profile...</p>
            ) : (
              <>
                {activeTab === "profile" && (
                  <ProfileSection
                    profileForm={profileForm}
                    setProfileForm={setProfileForm}
                    handleProfileSave={handleProfileSave}
                    saving={saving}
                    userData={userData}
                    setMessage={setMessage}
                  />
                )}

                {activeTab === "appearance" && <AppearanceSection />}

                {activeTab === "security" && <SecuritySection goToChangePassword={goToChangePassword} />}

                {activeTab === "danger" && <DangerSection handleDelete={handleDelete} />}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// Subcomponents
function SidebarButton({ active, onClick, icon, label, accent = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 text-sm px-3 py-2 rounded-md transition justify-start ${
        active ? "bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-700"
      } ${accent ? "text-red-600" : ""}`}
      aria-pressed={active}
    >
      <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function ProfileSection({ profileForm, setProfileForm, handleProfileSave, saving, userData, setMessage }) {
  return (
    <section className="space-y-4">
      <h4 className="text-lg font-semibold">Profile</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400">Your public display information.</p>

      <div className="flex flex-col gap-4 mt-4">
        {["name", "email"].map((field) => (
          <div key={field} className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
            <label className="block text-sm font-medium capitalize">{field}</label>
            <input
              type={field === "email" ? "email" : "text"}
              value={profileForm[field]}
              onChange={(e) => setProfileForm({ ...profileForm, [field]: e.target.value })}
              className="mt-2 w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-transparent"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={handleProfileSave}
          disabled={saving}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>

        <button
          onClick={() => {
            setProfileForm({ name: userData.name || "", email: userData.email || "" });
            setMessage("Reverted changes.");
            setTimeout(() => setMessage(""), 1500);
          }}
          className="px-4 py-2 border rounded-lg hover:shadow-sm transition"
        >
          Reset
        </button>
      </div>
    </section>
  );
}

function AppearanceSection() {
  return (
    <section className="space-y-4">
      <h4 className="text-lg font-semibold">Appearance</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400">Toggle theme and other visual preferences.</p>

      <div className="mt-4 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div>
          <h5 className="font-medium">Theme</h5>
          <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark mode.</p>
        </div>
        <ThemeToggle />
      </div>
    </section>
  );
}

function SecuritySection({ goToChangePassword }) {
  return (
    <section className="space-y-4">
      <h4 className="text-lg font-semibold">Security</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400">Manage password and security options.</p>

      <div className="mt-4 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h5 className="font-medium">Change password</h5>
        <p className="text-sm text-gray-500 mt-1">We'll redirect you to the secure change password flow.</p>
        <div className="mt-3">
          <button onClick={goToChangePassword} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            Change password
          </button>
        </div>
      </div>
    </section>
  );
}

function DangerSection({ handleDelete }) {
  return (
    <section className="space-y-6">
      <h4 className="text-lg font-semibold text-red-600">Danger Zone</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400">Actions here are irreversible. Use with care.</p>

      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h5 className="font-medium">Delete account</h5>
        <p className="text-sm text-gray-500 mt-1">Permanently delete your account and all data associated with it.</p>
        <div className="mt-4">
          <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            Delete account
          </button>
        </div>
      </div>
    </section>
  );
}
