import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import StudentRegister from './pages/auth/StudentRegister';
import CompanyRegister from './pages/auth/CompanyRegister';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentsManagement from './pages/admin/StudentsManagement';
import CompaniesManagement from './pages/admin/CompaniesManagement';
import DrivesManagement from './pages/admin/DrivesManagement';
import ApplicationsManagement from './pages/admin/ApplicationsManagement';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import PolicySettings from './pages/admin/PolicySettings';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import JobDrives from './pages/student/JobDrives';
import MyApplications from './pages/student/MyApplications';
import MyInterviews from './pages/student/MyInterviews';
import MyOffers from './pages/student/MyOffers';

// Company Pages
import CompanyDashboard from './pages/company/CompanyDashboard';
import CompanyProfile from './pages/company/CompanyProfile';
import CompanyDrives from './pages/company/CompanyDrives';
import ApplicantsManagement from './pages/company/ApplicantsManagement';
import CompanyInterviews from './pages/company/CompanyInterviews';
import CompanyOffers from './pages/company/CompanyOffers';

// Root Redirect Component
const RootRedirect = () => {
  const { user, token, loading } = useAuth();

  if (loading) return null;
  if (!token || !user) return <Navigate to="/login" replace />;

  if (user.role === 'ROLE_ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'ROLE_COMPANY') return <Navigate to="/company/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register/student" element={<StudentRegister />} />
          <Route path="/register/company" element={<CompanyRegister />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<StudentsManagement />} />
              <Route path="/admin/companies" element={<CompaniesManagement />} />
              <Route path="/admin/drives" element={<DrivesManagement />} />
              <Route path="/admin/applications" element={<ApplicationsManagement />} />
              <Route path="/admin/analytics" element={<AnalyticsPage />} />
              <Route path="/admin/policies" element={<PolicySettings />} />
            </Route>
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_STUDENT']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/profile" element={<StudentProfile />} />
              <Route path="/student/drives" element={<JobDrives />} />
              <Route path="/student/applications" element={<MyApplications />} />
              <Route path="/student/interviews" element={<MyInterviews />} />
              <Route path="/student/offers" element={<MyOffers />} />
            </Route>
          </Route>

          {/* Company Recruiter Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_COMPANY']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/company/dashboard" element={<CompanyDashboard />} />
              <Route path="/company/profile" element={<CompanyProfile />} />
              <Route path="/company/drives" element={<CompanyDrives />} />
              <Route path="/company/applicants" element={<ApplicantsManagement />} />
              <Route path="/company/interviews" element={<CompanyInterviews />} />
              <Route path="/company/offers" element={<CompanyOffers />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
