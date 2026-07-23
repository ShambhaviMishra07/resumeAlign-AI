import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Analyzer from "./pages/Analyzer";
import ResumeBuilder from "./pages/ResumeBuilder";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login?redirect=builder" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="animated-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="blob blob-4" />
      </div>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/analyzer" element={<Analyzer />} />
        <Route
          path="/builder"
          element={
            <ProtectedRoute>
              <ResumeBuilder />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}