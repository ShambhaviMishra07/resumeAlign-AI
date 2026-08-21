import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute   from './components/ProtectedRoute';
import AppLayout        from './layouts/AppLayout';
import LandingPage      from './pages/LandingPage';
import Login            from './pages/Login';
import Register         from './pages/Register';
import Dashboard        from './pages/Dashboard';
import Transactions     from './pages/Transactions';
import Budget           from './pages/Budget';
import Analytics        from './pages/Analytics';
import Settings         from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root → landing page */}
          <Route path="/"         element={<Navigate to="/home" replace />} />

          {/* Public routes */}
          <Route path="/home"     element={<LandingPage />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes — all inside AppLayout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard"    element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/budget"       element={<Budget />} />
            <Route path="/analytics"    element={<Analytics />} />
            <Route path="/settings"     element={<Settings />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;