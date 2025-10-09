import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Groups from "./pages/Groups";
import Teachers from "./pages/Teachers";
import Students from "./pages/Students";
import Requests from "./pages/Requests";
import Attendance from "./pages/Attendance";
import ProtectedLayout from "./layout/ProtectedLayout";
import ThemeToggle from "./Components/ThemeToggle";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ThemeToggle/>}/>
        <Route path="/login" element={<Login />} />
        {/* <Route element={<ProtectedLayout />}> */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/students" element={<Students />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/attendance" element={<Attendance />} />
        {/* </Route> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
