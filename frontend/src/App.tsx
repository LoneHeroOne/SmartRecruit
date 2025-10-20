import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "./components/common/AppShell";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import ForgotPassword from "./Pages/ForgotPassword";
import Jobs from "./Pages/Jobs";
import ApplicationForm from "./Pages/ApplicationForm";
import AdminApplications from "./Pages/AdminApplications";
import AdminJobCreate from "./Pages/AdminJobCreate";
import JobView from "./Pages/JobView";
import ProtectedRoute from "./components/common/ProtectedRoute";

// new lightweight wrappers
import CandidateSignup from "./Pages/CandidateSignup";
import CompanySignup from "./Pages/CompanySignup";
import MySpace from "./Pages/MySpace";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Legacy auth paths you already had */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* 🔹 TuniJobs-like auth paths (aliases) */}
        <Route path="/auth/signin" element={<Login />} />
        <Route path="/candidate/signup" element={<CandidateSignup />} />
        <Route path="/company/signup" element={<CompanySignup />} />

        {/* App shell (navbar persists inside) */}
        <Route element={<AppShell />}>
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:jobId" element={<JobView />} />
          <Route path="/apply/:jobId" element={<ApplicationForm />} />

          {/* My Space: any authenticated user */}
          <Route
            path="/me"
            element={
              <ProtectedRoute>
                <MySpace />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin/applications"
            element={
              <ProtectedRoute adminOnly>
                <AdminApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/create-job"
            element={
              <ProtectedRoute roles={["admin","company"]}>
                <AdminJobCreate />
              </ProtectedRoute>
            }
          />
          {/* Optional analytics page route if you have a separate page */}
          {/* <Route path="/admin/analytics" element={<ProtectedRoute adminOnly><AdminAnalyticsPage/></ProtectedRoute>} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
