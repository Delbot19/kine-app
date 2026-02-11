import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
  const { user } = useAuth();

  const getHomeLink = () => {
    if (user?.role === "admin") return "/admin/dashboard";
    if (user?.role === "kine" || user?.role === "kinesitherapeute") return "/kine/dashboard";
    return "/dashboard";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <Link to={getHomeLink()} className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
