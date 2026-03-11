import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Tasks from "./pages/Tasks";
import UserManagement from "./pages/UserManagement ";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Login is fully standalone — no sidebar, no wrapper */}
      <Route path="/" element={<Login />} />

      {/* Protected pages manage their own layout internally */}
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />

      <Route path="/projects" element={
        <ProtectedRoute><Projects /></ProtectedRoute>
      } />
<Route path="/admin/users" element={<UserManagement />} />

      <Route path="/projects/:id" element={
        <ProtectedRoute><ProjectDetails /></ProtectedRoute>
      } />

      <Route path="/tasks" element={
        <ProtectedRoute><Tasks /></ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;