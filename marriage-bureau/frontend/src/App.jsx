import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useState } from 'react';
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/profile/Profile';
import Search from './pages/search/Search';
import Interests from './pages/interests/Interests';
import AdminDashboard from './pages/admin/AdminDashboard';
import Messages from './pages/messages/Messages';
import Navbar from './components/layout/Navbar';

function ProtectedLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('token')));
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('userRole') === 'admin');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setIsAdmin={setIsAdmin} />} />
        <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} setIsAdmin={setIsAdmin} />} />
        
        {isAuthenticated ? (
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/search" element={<Search />} />
            <Route path="/interests" element={<Interests />} />
            <Route path="/messages" element={<Messages />} />
            {isAdmin && <Route path="/admin" element={<AdminDashboard />} />}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;