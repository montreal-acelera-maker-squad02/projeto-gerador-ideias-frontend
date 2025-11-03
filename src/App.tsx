import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HistoryPage from "@/pages/History";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </Router>
  );
}
