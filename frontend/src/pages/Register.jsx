import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../Components/ThemeToggle";
import { registerUser, verify } from "../api/api";
import {
  FiUser,
  FiMail,
  FiLock,
  FiCheck,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import gsap from "gsap";
import { useAuth } from "../context/UseAuth";

const Register = () => {
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
  const [errors, setErrors] = useState({});
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
    group: "",
    role: "",
    gender: "",
  });

  useEffect(() => {
    gsap.fromTo(
      formRef.current.children,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, duration: 0.6, ease: "power2.out" }
    );
  }, []);

  // Hover animation
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

  const validateForm = () => {
    const newErrors = {};

    if (!formValues.name.trim()) newErrors.name = "Full name is required.";
    if (!formValues.email.trim()) newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email))
      newErrors.email = "Invalid email format.";

    if (!formValues.password) newErrors.password = "Password is required.";
    else if (formValues.password.length < 8)
      newErrors.password = "Password must be at least 8 characters.";
    else if (
      !/[A-Za-z]/.test(formValues.password) ||
      !/\d/.test(formValues.password)
    )
      newErrors.password = "Use letters and numbers for a strong password.";

    if (!formValues.group.trim()) newErrors.group = "Group is required.";
    if (!formValues.role) newErrors.role = "Please select a role.";
    if (!formValues.gender) newErrors.gender = "Please select a gender.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log(formValues);
      const response = await registerUser(formValues);
      if (response.status === 201) {
        const verifyRes = await verify();
        if (verifyRes.status === 200 && verifyRes.data?.userdata) {
          setUser(verifyRes.data.userdata);
        }
        navigate("/");
      }
    } catch (error) {
      const msg =
        error.response?.data?.message || "Registration failed. Try again.";
      setErrors((prev) => ({ ...prev, general: msg }));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  return (
    <div className="w-full max-w-md relative">
      <div className="flex justify-end  relative z-10">
        <ThemeToggle />
      </div>

      <div className="absolute -inset-1 bg-gradient-to-tr from-blue-500 via-purple-500 to-cyan-400 rounded-3xl blur-2xl opacity-30 dark:opacity-40 animate-pulse-slow pointer-events-none"></div>

      <div
        ref={wrapperRef}
        className="relative rounded-3xl transition-all duration-300 cursor-pointer"
      >
        <div
          ref={formRef}
          className="relative backdrop-blur-xl bg-white/20 dark:bg-gray-900/50 border border-white/20 dark:border-gray-700/40
                     rounded-3xl p-10 shadow-[0_0_30px_-10px_rgba(0,0,0,0.4)]"
        >
          <div className="text-center mb-5">
            <h2
              className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-600 
                           bg-clip-text text-transparent tracking-tight drop-shadow-sm"
            >
              Join the Future
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
              Create your account below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputWithIcon
              label="Full Name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={formValues.name}
              onChange={handleChange}
              icon={<FiUser />}
              error={errors.name}
            />

            <InputWithIcon
              label="Email"
              name="email"
              type="email"
              placeholder="example@email.com"
              value={formValues.email}
              onChange={handleChange}
              icon={<FiMail />}
              error={errors.email}
              hint="We’ll never share your email."
            />

            <InputWithIcon
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formValues.password}
              onChange={handleChange}
              icon={<FiLock />}
              error={errors.password}
              hint="Use at least 8 characters with letters & numbers."
            />

            <InputWithIcon
              label="Class"
              name="group"
              type="text"
              placeholder="e.g. G-4"
              value={formValues.group}
              onChange={handleChange}
              icon={<FiCheck />}
              error={errors.group}
            />

            <div className="flex gap-2">
              {/* Gender */}
              <div className="flex-1">
                <label
                  htmlFor="gender"
                  className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-1"
                >
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formValues.gender || ""}
                  onChange={handleChange}
                  className=" block w-full px-4 py-2.5 bg-white/10 border border-gray-500/40 rounded-xl
                 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none
                 text-gray-600 dark:text-gray-400 transition-all duration-200 dark:bg-gray-900 dark:border-gray-700"
                >
                  <option value="" >Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                {errors.gender && (
                  <p className="text-xs text-red-500 mt-1">{errors.gender}</p>
                )}
              </div>
              {/* Role */}
              <div className="flex-1">
                <label
                  htmlFor="role"
                  className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-1"
                >
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formValues.role}
                  onChange={handleChange}
                  className=" block w-full px-4 py-2.5 bg-white/10 border border-gray-500/40 rounded-xl
                 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none
                 text-gray-600 dark:text-gray-400 transition-all duration-200 dark:bg-gray-900 dark:border-gray-700"
                >
                  <option value="">Select role</option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
                {errors.role && (
                  <p className="text-xs text-red-500 mt-1">{errors.role}</p>
                )}
              </div>

              
            </div>

            {errors.general && (
              <p className="text-sm text-center text-red-500 mt-2">
                {errors.general}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 rounded-xl font-semibold text-white
                         bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400
                         shadow-lg hover:shadow-purple-500/30 transition-transform transform hover:-translate-y-1
                         duration-300 ease-out focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              {loading ? "Registering..." : "Create Account"}
            </button>

            <p className="text-sm text-center text-gray-600 dark:text-gray-300 mt-4">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors duration-200"
              >
                Login
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

// Input with icons + toggle + error messages
const InputWithIcon = ({
  label,
  name,
  type,
  placeholder,
  value,
  onChange,
  icon,
  hint,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="relative">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {icon}
          </span>
        )}

        <input
          id={name}
          name={name}
          type={isPassword && showPassword ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
          className={`mt-1 block w-full ${
            icon ? "pl-10" : "pl-4"
          } pr-10 py-2.5 bg-white/10 border ${
            error ? "border-red-500/60" : "border-gray-500/40"
          } rounded-xl
            focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none
            text-gray-900 dark:text-gray-200 placeholder-gray-600 dark:placeholder-gray-400
            transition-all duration-200 dark:bg-gray-900 dark:border-gray-700`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-purple-500 transition-colors"
          >
            {showPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {hint && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{hint}</p>
      )}
    </div>
  );
};

export default Register;
