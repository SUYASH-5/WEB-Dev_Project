import { loginAdmin } from "../api/api";
import ThemeToggle from "../Components/ThemeToggle";
import { useNavigate } from "react-router-dom";


const Login = () => {
  const Navigate = useNavigate();
  const token = localStorage.getItem('token');
  if (token) {
    Navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    try {
      const response = await loginAdmin(data);
      console.log(response);
      localStorage.setItem('token', response.data.token);
      Navigate('/dashboard');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-sm">
        <ThemeToggle/>

        
        {/* The Card Container */}
        <div className="bg-white p-8 border border-gray-200 rounded-xl shadow-2xl shadow-gray-200/50
                     dark:bg-gray-800 dark:border-gray-700 dark:shadow-none">

          {/* Title and Subtitle */}
          <h2 className="text-3xl font-bold mb-2 text-gray-900 text-center tracking-tight dark:text-white">
            Admin Login
          </h2>
          <p className="text-center text-sm text-gray-500 mb-8 dark:text-gray-400">
            Access the control panel
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Username Input */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="admin_example"
                required
                // 4. INPUT FIELD STYLES
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150
                           dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
              />
            </div>

            {/* Password Input */}
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
                // 5. INPUT FIELD STYLES
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150
                           dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <a href="/forget-password" 
                 // 6. LINK STYLES
                 className="text-sm font-medium text-blue-500 hover:text-blue-600 transition duration-150 dark:text-blue-400 dark:hover:text-blue-300">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              // 7. BUTTON STYLES (Primary button usually maintains a high contrast, but we'll adjust the color for dark mode)
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition duration-200 ease-in-out
                         dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-600"
            >
              Sign In
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Login;