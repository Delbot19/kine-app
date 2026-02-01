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
import { Toaster } from '@/components/ui/toaster';
import ProLayout from '@/components/layout/ProLayout';
import KineDashboard from '@/pages/kine/KineDashboard';
import KinePatients from '@/pages/kine/KinePatients';
import KinePlanning from '@/pages/kine/KinePlanning';
import KineTraitements from '@/pages/kine/KineTraitements';
import { AuthProvider } from './contexts/AuthContext';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/dashboard" element={<PatientDashboard />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/treatment" element={<TreatmentPage />} />
            <Route path="/exercises" element={<PatientExercises />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/resources/:id" element={<ArticleDetail />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          {/* Interface Kinésithérapeute */}
          <Route path="/kine" element={<ProLayout />}>
            <Route path="dashboard" element={<KineDashboard />} />
            <Route path="patients" element={<KinePatients />} />
            <Route path="planning" element={<KinePlanning />} />
            <Route path="traitements" element={<KineTraitements />} />
            <Route path="prescriptions" element={<div className="p-4">Prescriptions (À venir)</div>} />
            <Route path="profil" element={<div className="p-4">Profil Professionnel (À venir)</div>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
};

export default App;
