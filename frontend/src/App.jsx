// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TestExitProvider } from './contexts/TestExitContext';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './components/MainLayout';
import AdminFeedback from './pages/AdminFeedback';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import TestList from './pages/TestList';
import TestDetail from './pages/TestDetail';
import AdminUsers from './pages/AdminUsers';
import AdminQuestions from './pages/AdminQuestions';
import AttemptsHistory from './pages/AttemptsHistory';
import Test from './pages/Test';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <TestExitProvider>
          {/* El Sidebar se ha eliminado de aquí */}
          <Routes>
            
            {/* --- ZONA PÚBLICA (Sin Sidebar) --- */}
            {/* Estas rutas se renderizan directamente, sin pasar por el MainLayout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* --- ZONA PRIVADA (Con Sidebar) --- */}
            {/* Esta ruta "padre" aplica el MainLayout a todas las rutas que contiene */}
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              }
            >
              {/* Todas estas rutas se renderizarán DENTRO del <Outlet /> del MainLayout */}
              <Route index element={<Dashboard />} /> {/* 'index' es la ruta por defecto para '/' */}
              <Route path="categories" element={<Categories />} />
              <Route path="categories/:cat" element={<TestList />} />
              <Route path="categories/:cat/:testId" element={<TestDetail />} />
              <Route path="history" element={<AttemptsHistory />} />
              <Route path="history/review/:attemptId" element={<TestDetail />} />
              <Route path="test" element={<Test />} />
              <Route path="simulacro/:testId" element={<TestDetail />} />
              <Route path="admin/users" element={<AdminUsers />} />
              <Route path="admin/questions" element={<AdminQuestions />} />
              <Route path="admin/feedback" element={<AdminFeedback />} />
            </Route>

            {/* Ruta comodín para redirigir a login si no se encuentra la ruta */}
            <Route path="*" element={<Login />} />

          </Routes>
        </TestExitProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}