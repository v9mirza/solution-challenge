import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout.jsx";
import { GuestRoute } from "./components/GuestRoute.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { SignupPage } from "./pages/SignupPage.jsx";
import { PatientPortalPage } from "./pages/PatientPortalPage.jsx";
import { PatientIntakePage } from "./pages/PatientIntakePage.jsx";
import { PatientStatusPage } from "./pages/PatientStatusPage.jsx";
import { StaffDashboardPage } from "./pages/StaffDashboardPage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        <Route element={<ProtectedRoute roles={["user"]} />}>
          <Route path="/patient" element={<PatientPortalPage />} />
          <Route path="/patient/intake" element={<PatientIntakePage />} />
          <Route path="/patient/status" element={<PatientStatusPage />} />
        </Route>

        <Route element={<ProtectedRoute roles={["staff"]} />}>
          <Route path="/staff" element={<StaffDashboardPage />} />
        </Route>

        <Route element={<ProtectedRoute roles={["user", "staff"]} />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
