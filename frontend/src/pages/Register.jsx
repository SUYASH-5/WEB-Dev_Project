import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../Components/ThemeToggle";
import { registerUser } from "../api/api"; // Make sure to have this API endpoint

const Register = () => {
    const navigate = useNavigate();
  const token = localStorage.getItem("userToken");
  if (token) navigate("/user/dashboard");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    setLoading(true);
    try {
      const response = await registerUser(data);
      alert("Registration successful! Please login.");
      console.log("Registration response:", response);
      window.location.href = "/user/login";
    } catch (error) {
      console.error("Registration failed:", error);
      alert(error.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-sm">
        <ThemeToggle />

        <div className="bg-white p-8 border border-gray-200 rounded-xl shadow-2xl shadow-gray-200/50
                        dark:bg-gray-800 dark:border-gray-700 dark:shadow-none mt-6">

          <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white text-center tracking-tight">
            User Registration
          </h2>
          <p className="text-center text-sm text-gray-500 mb-8 dark:text-gray-400">
            Create a new account
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="user_example"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
                           placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                           transition duration-150 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="example@email.com"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
                           placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                           transition duration-150 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
                           placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                           transition duration-150 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="••••••••"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
                           placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                           transition duration-150 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold
                         text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900
                         transition duration-200 ease-in-out dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-600"
            >
              {loading ? "Registering..." : "Register"}
            </button>

            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-4">
              Already have an account? <a href="/user/login" className="text-blue-500 dark:text-blue-400 hover:underline">Login</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
