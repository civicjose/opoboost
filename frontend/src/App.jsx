// frontend/src/App.jsx

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Sidebar from './components/Sidebar'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Categories from './pages/Categories'
import TestList from './pages/TestList'
import TestDetail from './pages/TestDetail'
import AdminUsers from './pages/AdminUsers'
import AttemptsHistory from './pages/AttemptsHistory'
import Test from './pages/Test' // Importamos la página de Simulacros/Test

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Sidebar />

        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas Privadas */}
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/categories" element={<PrivateRoute><Categories /></PrivateRoute>} />
          <Route path="/categories/:cat" element={<PrivateRoute><TestList /></PrivateRoute>} />
          <Route path="/categories/:cat/:testId" element={<PrivateRoute><TestDetail /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><AttemptsHistory /></PrivateRoute>} />
          
          {/* RUTA AÑADIDA PARA LA PÁGINA DE SELECCIÓN DE SIMULACRO */}
          <Route path="/test" element={<PrivateRoute><Test /></PrivateRoute>} />

          {/* RUTA AÑADIDA PARA MOSTRAR EL TEST DEL SIMULACRO */}
          <Route path="/simulacro/:testId" element={<PrivateRoute><TestDetail /></PrivateRoute>} />

          {/* Rutas de Admin/Profesor */}
          <Route path="/admin/users" element={<PrivateRoute roles={['administrador']}><AdminUsers /></PrivateRoute>} />
          {/* Ruta Comodín */}
          <Route path="*" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}