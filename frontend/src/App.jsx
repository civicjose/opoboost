import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider }                from './contexts/AuthContext'
import PrivateRoute                     from './components/PrivateRoute'
import Sidebar                          from './components/Sidebar'

import Login        from './pages/Login'
import Register     from './pages/Register'
import Dashboard    from './pages/Dashboard'
import Categories   from './pages/Categories'
import TestList     from './pages/TestList'
import TestDetail   from './pages/TestDetail'
import ManageTopics from './pages/ManageTopics'
import AdminUsers   from './pages/AdminUsers'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Sidebar />

        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/categories"
            element={
              <PrivateRoute>
                <Categories />
              </PrivateRoute>
            }
          />

          <Route
            path="/categories/:cat"
            element={
              <PrivateRoute roles={['alumno','profesor','administrador']}>
                <TestList />
              </PrivateRoute>
            }
          />

          <Route
            path="/categories/:cat/:testId"
            element={
              <PrivateRoute roles={['alumno','profesor','administrador']}>
                <TestDetail />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/topics"
            element={
              <PrivateRoute roles={['profesor','administrador']}>
                <ManageTopics />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <PrivateRoute roles={['administrador']}>
                <AdminUsers />
              </PrivateRoute>
            }
          />

          <Route
            path="*"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
)
}
