import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ApplicationTable from "./pages/ApplicationTable"; // Make sure this path is correct
import 'bootstrap/dist/css/bootstrap.min.css';
import Settings from "./pages/Settings";

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/applications" element={<ApplicationTable />} />
            <Route path="/settings" element={<Settings />}></Route>
            {/* Add other routes, like Dashboard */}
        </Routes>
      </Router>
  );
}

export default App;
