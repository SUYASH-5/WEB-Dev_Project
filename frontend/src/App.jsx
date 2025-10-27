import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import {ProtectedRoute} from "./Layout/ProtectedLayout";
import Dashboard from "./pages/Dashboard";
import NotesPage from "./components/NotesPage";
import PageTransitionLayout from "./Layout/Transition";
import LivePage from "./pages/Live";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PageTransitionLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/notes/:id" element={
          <ProtectedRoute>
            <NotesPage />
          </ProtectedRoute>
        } />
        <Route path="/live/:id" element={
          <ProtectedRoute>
            <LivePage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
