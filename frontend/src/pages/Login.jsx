import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { login, verify } from "../api/api";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import gsap from "gsap";
import PropTypes from "prop-types";
import { useAuth } from "../context/UseAuth";

const UserLogin = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const wrapperRef = useRef(null);
  const safeVerify = async () => {
    const res = await verify();
    if (res.status === 200) {
      return { ok: true };
    } else if (res.status === 204) {
      return { ok: false };
    }
    return { ok: false };
  };

  useEffect(() => {
    const checkAuth = async () => {
      const check = await safeVerify();
      if (check.ok) navigate("/");
    };
    checkAuth();
  }, [navigate]);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    gsap.fromTo(
      formRef.current.children,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, duration: 0.6, ease: "power2.out" }
    );
  }, []);
  useEffect(() => {
    const el = wrapperRef.current;

    const hoverIn = () => {
      gsap.to(el, {
        y: -3,
        boxShadow:
          "0 0 60px 10px rgba(128,0,255,0.6), 0 0 40px 5px rgba(0,255,255,0.4)",
        duration: 0.4,
        ease: "power2.out",
      });
    };

    const hoverOut = () => {
      gsap.to(el, {
        y: 0,
        boxShadow: "0 0 30px -10px rgba(0,0,0,0.4)",
        duration: 0.4,
        ease: "power2.out",
      });
    };

    el.addEventListener("mouseenter", hoverIn);
    el.addEventListener("mouseleave", hoverOut);

    return () => {
      el.removeEventListener("mouseenter", hoverIn);
      el.removeEventListener("mouseleave", hoverOut);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    data.rememberMe = rememberMe;

    if (!data.email || !data.password) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await login(data);
      if (response.status === 200) {
        const verifyRes = await verify();
        if (verifyRes.status === 200 && verifyRes.data?.userdata) {
          setUser(verifyRes.data.userdata);
        }
        navigate("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative">
      {/* Theme toggle */}
      <div className="flex justify-end mb-2 relative z-10">
        <ThemeToggle />
      </div>

      {/* Gradient Glow Background */}
      <div
        className="absolute -inset-1 bg-gradient-to-tr from-blue-500 via-purple-500 to-cyan-400 
                      rounded-3xl blur-2xl opacity-30 dark:opacity-40 animate-pulse-slow pointer-events-none"
      ></div>

      {/* Glass Card Wrapper */}
      <div
        ref={wrapperRef}
        className="relative rounded-3xl transition-all duration-300 cursor-pointer"
      >
        <div
          ref={formRef}
          className="relative backdrop-blur-xl bg-white/20 dark:bg-gray-900/50 border border-white/20 dark:border-gray-700/40
                     rounded-3xl p-10 shadow-[0_0_30px_-10px_rgba(0,0,0,0.4)]"
        >
          <div className="text-center mb-8">
            <h2
              className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-600
                           bg-clip-text text-transparent tracking-tight drop-shadow-sm"
            >
              Welcome Back
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
              The Class is waiting for you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputWithIcon
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              icon={<FiMail className="text-gray-400 dark:text-gray-500" />}
              hint="We’ll never share your email."
            />

            <InputWithIcon
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              icon={<FiLock className="text-gray-400 dark:text-gray-500" />}
              hint="Use at least 8 characters with letters & numbers."
              togglePassword={() => setShowPassword(!showPassword)}
              showPassword={showPassword}
            />

            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="accent-purple-500"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-gray-600 dark:text-gray-400">
                  Remember me
                </span>
              </label>
              <a
                href="/forget-password"
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium transition"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 rounded-xl font-semibold text-white
                         bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400
                         shadow-lg hover:shadow-purple-500/30 transition-transform transform hover:-translate-y-1
                         duration-300 ease-out focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              {loading ? "Logging in..." : "Access Dashboard"}
            </button>

            <p className="text-sm text-center text-gray-600 dark:text-gray-300 mt-4">
              Don’t have an account?{" "}
              <a
                href="/register"
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors duration-200"
              >
                Create one
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
// Input with icon and optional hint & password toggle
const InputWithIcon = ({
  label,
  name,
  type,
  placeholder,
  icon,
  hint,
  togglePassword,
  showPassword,
}) => (
  <div className="relative">
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1"
    >
      {label}
    </label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required
        className={`mt-1 block w-full pl-10 pr-12 py-2.5 bg-white/10 border border-gray-500/40 rounded-xl
                   focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none
                   text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 dark:bg-gray-900 dark:border-gray-700`}
      />
      {togglePassword && (
        <button
          type="button"
          onClick={togglePassword}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
        >
          {showPassword ? <FiEye /> : <FiEyeOff />}
        </button>
      )}
    </div>
    {hint && (
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{hint}</p>
    )}
  </div>
);

InputWithIcon.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  icon: PropTypes.node,
  hint: PropTypes.string,
  togglePassword: PropTypes.func,
  showPassword: PropTypes.bool,
};

InputWithIcon.defaultProps = {
  type: "text",
  placeholder: "",
  icon: null,
  hint: "",
  togglePassword: undefined,
  showPassword: false,
};

export default UserLogin;
