import { useNavigate } from "react-router-dom";

const ProtectedLayout = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  if (!token) {
    navigate("/login");
    return null;
  }
  return (
    <div>
      <h1>Protected Content</h1>
    </div>
  )
}

export default ProtectedLayout