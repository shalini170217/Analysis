import { Routes, Route, Link } from "react-router-dom";
import Dashboard from "./dashboard";

export default function App() {
  return (
    <div>
      <nav style={{ padding: "1rem", background: "#f0f0f0" }}>
        <Link to="/" style={{ marginRight: "1rem" }}>Home</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>

      <Routes>
       
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}
