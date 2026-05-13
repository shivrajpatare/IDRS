import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CommandDashboard from './pages/CommandDashboard';
import CitizenSOS from './pages/CitizenSOS';
import CitizenRecovery from './pages/CitizenRecovery';
import CitizenDashboard from './pages/CitizenDashboard';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('idrs_token');

  if (loading) return <div className="h-screen w-screen bg-slate-950 flex items-center justify-center text-white font-black uppercase tracking-widest text-xs">Authenticating...</div>;
  if (!token || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.some(r => r.toUpperCase() === user.role.toUpperCase())) return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<LoginPage />} />
          <Route path="/unauthorized" element={
            <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-6">
              <p className="text-lg font-bold">Session Expired</p>
              <button onClick={() => { localStorage.removeItem('idrs_token'); window.location.href = '/login'; }} className="px-8 py-3 bg-cyan-600 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-cyan-500 transition-colors">
                Return to Login
              </button>
            </div>
          } />

          {/* Citizen Routes */}
          <Route path="/citizen" element={
            <ProtectedRoute roles={['CITIZEN', 'ADMIN']}>
              <CitizenDashboard />
            </ProtectedRoute>
          } />
          <Route path="/citizen/sos" element={
            <ProtectedRoute roles={['CITIZEN', 'ADMIN']}>
              <CitizenSOS />
            </ProtectedRoute>
          } />
          <Route path="/citizen/recovery" element={
            <ProtectedRoute roles={['CITIZEN', 'ADMIN']}>
              <CitizenRecovery />
            </ProtectedRoute>
          } />

          {/* Command Routes */}
          <Route path="/command" element={
            <ProtectedRoute roles={['RESPONDER', 'ADMIN']}>
              <CommandDashboard />
            </ProtectedRoute>
          } />

          {/* Default routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
