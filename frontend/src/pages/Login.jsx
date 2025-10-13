import { Navigate } from "react-router-dom";
import ThemeToggle from "../Components/ThemeToggle";
import { login } from "../api/api"; // Assuming you have a separate API file for users

const UserLogin = () => {
  const token = localStorage.getItem("userToken");
  if (token) return <Navigate to="/user/dashboard" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      const response = await login(data);
      localStorage.setItem("userToken", response.data.token);
      window.location.href = "/user/dashboard"; // redirect after login
    } catch (error) {
      console.error("Login failed:", error);
      alert("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-sm">
        <ThemeToggle />

        <div className="bg-white p-8 border border-gray-200 rounded-xl shadow-2xl shadow-gray-200/50
                        dark:bg-gray-800 dark:border-gray-700 dark:shadow-none mt-6">

          <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white text-center tracking-tight">
            User Login
          </h2>
          <p className="text-center text-sm text-gray-500 mb-8 dark:text-gray-400">
            Access your account
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

            <div className="text-right">
              <a href="/forget-password"
                 className="text-sm font-medium text-blue-500 hover:text-blue-600 transition duration-150 dark:text-blue-400 dark:hover:text-blue-300">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold
                         text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900
                         transition duration-200 ease-in-out dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-600"
            >
              Sign In
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
