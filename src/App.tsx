import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import QuizBrowser from './pages/QuizBrowser';
import QuizPage from './pages/QuizPage';
import Results from './pages/Results';
import AdminDashboard from './pages/admin/AdminDashboard';
import QuizManagement from './pages/admin/QuizManagement';
import UserAnalytics from './pages/admin/UserAnalytics';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />

          <Route path="/quizzes" element={
            <ProtectedRoute><QuizBrowser /></ProtectedRoute>
          } />

          <Route path="/quiz/:quizId" element={
            <ProtectedRoute><QuizPage /></ProtectedRoute>
          } />

          <Route path="/results/:quizId" element={
            <ProtectedRoute><Results /></ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
          } />

          <Route path="/admin/quizzes" element={
            <ProtectedRoute adminOnly><QuizManagement /></ProtectedRoute>
          } />

          <Route path="/admin/analytics" element={
            <ProtectedRoute adminOnly><UserAnalytics /></ProtectedRoute>
          } />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
