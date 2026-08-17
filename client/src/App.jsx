import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Analyzer from "./pages/Analyzer";
import ResumeBuilder from "./pages/ResumeBuilder";
import Agent from "./pages/Agent";

const Protected = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login?redirect=protected" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<Landing />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/analyzer" element={<Analyzer />} />
        <Route path="/agent"    element={<protected><Agent /></protected>} />
        <Route path="/builder"  element={<Protected><ResumeBuilder /></Protected>} />
      </Routes>
    </BrowserRouter>
  );
}