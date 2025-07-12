// frontend/src/components/Sidebar.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importar useNavigate
import { useTestExit } from '../contexts/TestExitContext';
import { AuthContext } from '../contexts/AuthContext';
import { Home, Grid, BookOpen, Users, Menu, LogOut, History as HistoryIcon, Edit } from 'lucide-react';

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const { attemptToNavigate } = useTestExit();
  const navigate = useNavigate(); // 2. AÑADIR ESTA LÍNEA QUE FALTABA

  // Función centralizada para manejar la navegación desde el sidebar
  const handleLinkClick = (path) => {
    setOpen(false);
    attemptToNavigate(path);
  };
  
  // Función para el logout
  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login'); // Ahora 'navigate' está definido y funcionará
  }

  const items = [
    { to: '/', label: 'Inicio', icon: <Home size={20} /> },
    { to: '/categories', label: 'Categorías', icon: <Grid size={20} /> },
    { to: '/test', label: 'Simulacro', icon: <BookOpen size={20} /> },
    { to: '/history', label: 'Historial', icon: <HistoryIcon size={20} /> },
    ...(user && (user.role === 'profesor' || user.role === 'administrador')
      ? [{ to: '/admin/questions', label: 'Preguntas', icon: <Edit size={20}/> }]
      : []),
    ...(user && user.role === 'administrador'
      ? [{ to: '/admin/users', label: 'Usuarios', icon: <Users size={20}/> }]
      : [])
  ];

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed top-4 left-4 p-2 bg-white/70 rounded backdrop-blur hover:bg-white/90 z-50"
      >
        <Menu size={24} className="text-primary"/>
      </button>

      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/30 transition-opacity z-40 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white/90 backdrop-blur-lg shadow-xl transform transition-transform z-50 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-6">
          <h1
            className="text-2xl font-bold text-primary mb-8 cursor-pointer select-none"
            onClick={() => setOpen(false)}
          >
            OpoBoost
          </h1>

          <nav className="flex-1 space-y-2">
            {items.map(i => (
              <button
                key={i.to}
                onClick={() => handleLinkClick(i.to)}
                className="w-full flex items-center space-x-3 text-gray-700 hover:text-primary p-2 rounded-md transition"
              >
                {i.icon}
                <span className="font-medium">{i.label}</span>
              </button>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-6 w-full flex items-center justify-center space-x-2 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
          >
            <LogOut size={20}/>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}