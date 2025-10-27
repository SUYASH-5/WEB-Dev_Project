import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center">
          {/* Spinner container */}
          <div className="relative w-20 h-20">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 border-4 border-gray-300 dark:border-gray-700 rounded-full animate-spin border-t-blue-500 dark:border-t-purple-500"></div>
            {/* Inner bouncing dot */}
            <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-blue-500 dark:bg-purple-500 rounded-full -translate-x-1/2 -translate-y-1/2 animate-bounce"></div>
          </div>

          {/* Loading text */}
          <span className="mt-6 text-gray-800 dark:text-gray-100 font-semibold text-lg tracking-wide">
            Verifying authentication...
          </span>
        </div>
      </div>
    );

  if (!user) {
    return navigate("/login");
  }

  return children;
};
