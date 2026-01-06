import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Index from './pages/Index';
import PatientDashboard from './pages/PatientDashboard';
import AppointmentsPage from './pages/AppointmentsPage';
import TreatmentPage from './pages/TreatmentPage';
import PatientExercises from './pages/PatientExercises';
import ResourcesPage from './pages/ResourcesPage';
import ArticleDetail from './pages/ArticleDetail';
import ProfilePage from './pages/ProfilePage';
import NotFound from './pages/NotFound';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';

const App = () => (
  <AuthProvider>
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<PatientDashboard />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/treatment" element={<TreatmentPage />} />
          <Route path="/exercises" element={<PatientExercises />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/resources/:id" element={<ArticleDetail />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  </AuthProvider>
);

export default App;
