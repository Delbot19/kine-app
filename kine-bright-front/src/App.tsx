import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/patient/Dashboard';
import AppointmentsPage from './pages/patient/Appointments';
import TreatmentPage from './pages/patient/Treatment';
import PatientExercises from './pages/patient/Exercises';
import ResourcesPage from './pages/patient/Resources';
import ArticleDetail from './pages/patient/ArticleDetail';
import ProfilePage from './pages/patient/Profile';
import NotFound from './pages/NotFound';
import AboutPage from './pages/patient/About';
import ContactPage from './pages/patient/Contact';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';
import ProLayout from '@/components/layout/ProLayout';
import KineDashboard from '@/pages/kine/KineDashboard';
import KinePatients from '@/pages/kine/KinePatients';
import KinePlanning from '@/pages/kine/KinePlanning';
import KineTraitements from '@/pages/kine/KineTraitements';
import KineProfile from '@/pages/kine/KineProfile';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AddKine from '@/pages/admin/AddKine';
import KineManagement from '@/pages/admin/KineManagement';
import AdminExerciseLibrary from '@/pages/admin/AdminExerciseLibrary';
import AdminResources from '@/pages/admin/AdminResources';
import KinePrescription from '@/pages/kine/KinePrescription';
import PatientManagement from '@/pages/admin/PatientManagement';
import SetupAccount from '@/pages/auth/SetupAccount';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <PatientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/appointments" element={
              <ProtectedRoute>
                <AppointmentsPage />
              </ProtectedRoute>
            } />
            <Route path="/treatment" element={
              <ProtectedRoute>
                <TreatmentPage />
              </ProtectedRoute>
            } />
            <Route path="/exercises" element={
              <ProtectedRoute>
                <PatientExercises />
              </ProtectedRoute>
            } />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/resources/:id" element={<ArticleDetail />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          {/* Interface Kinésithérapeute */}
          <Route path="/kine" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <ProLayout />
              </ErrorBoundary>
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<KineDashboard />} />
            <Route path="patients" element={<KinePatients />} />
            <Route path="planning" element={<KinePlanning />} />
            <Route path="prescriptions" element={<KinePrescription />} />
            <Route path="traitements" element={<KineTraitements />} />
            <Route path="profil" element={<KineProfile />} />
          </Route>

          {/* Interface Administrateur */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <AdminLayout />
              </ErrorBoundary>
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="kines" element={<KineManagement />} />
            <Route path="kines/new" element={<AddKine />} />
            <Route path="patients" element={<PatientManagement />} />
            <Route path="exercices" element={<AdminExerciseLibrary />} />
            <Route path="ressources" element={<AdminResources />} />
          </Route>

          <Route path="/setup-account" element={<SetupAccount />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
};

export default App;
