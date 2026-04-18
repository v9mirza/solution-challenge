import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { PatientPortalPage } from "./pages/PatientPortalPage.jsx";
import { StaffDashboardPage } from "./pages/StaffDashboardPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/patient" element={<PatientPortalPage />} />
        <Route path="/staff" element={<StaffDashboardPage />} />
      </Route>
    </Routes>
  );
}
