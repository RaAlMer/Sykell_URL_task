import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import UrlDetail from "./pages/UrlDetail";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/urls/:id" element={<UrlDetail />} />
    </Routes>
  );
}

export default App;
