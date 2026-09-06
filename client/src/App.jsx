import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing      from "./pages/Landing";
import Login        from "./pages/Login";
import Analyzer     from "./pages/Analyzer";
import Agent        from "./pages/Agent";
import ResumeBuilder from "./pages/ResumeBuilder";

const Protected = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login?redirect=protected" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<Landing />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/analyzer" element={<Analyzer />} />
        <Route path="/agent"   element={<Protected><Agent /></Protected>} />
        <Route path="/builder" element={<Protected><ResumeBuilder /></Protected>} />
      </Routes>
    </BrowserRouter>
  );
}