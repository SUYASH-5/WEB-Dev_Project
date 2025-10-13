import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { verifySession } from "../api/api"; // make a backend route to verify cookie

const ProtectedLayout = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await verifySession();
        setAuthenticated(true);
      } catch {
        setAuthenticated(false);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-700 dark:text-gray-300">
        Loading...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-700 dark:text-gray-300">
        <p>Your session has expired or is invalid.</p>
        <button
          className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
          onClick={() => navigate("/")}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedLayout;
