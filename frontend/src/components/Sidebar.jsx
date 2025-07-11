import { useState, useContext } from 'react'
import { Home, Grid, BookOpen, FilePlus, Users, Menu, LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'

export default function Sidebar() {
  const [open, setOpen]  = useState(false)
  const { user, logout } = useContext(AuthContext)
  const nav              = useNavigate()

  const items = [
    { to: '/',            label: 'Inicio',     icon: <Home size={20}/> },
    { to: '/categories',  label: 'Categorías', icon: <Grid size={20}/> },
    { to: '/simulacro',   label: 'Simulacro',  icon: <BookOpen size={20}/> },
    ...(user && (user.role==='profesor'||user.role==='administrador')
      ? [{ to: '/upload',         label: 'Subir PDF', icon: <FilePlus size={20}/> }]
      : []),
    ...(user && (user.role==='profesor'||user.role==='administrador')
      ? [{ to: '/admin/topics',   label: 'Temas',      icon: <Grid size={20}/> }]
      : []),
    ...(user && user.role==='administrador'
      ? [{ to: '/admin/users',    label: 'Usuarios',   icon: <Users size={20}/> }]
      : [])
  ]

  return (
    <>
      {/* Botón para abrir/cerrar */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed top-4 left-4 p-2 bg-white/70 rounded backdrop-blur hover:bg-white/90 z-50"
      >
        <Menu size={24} className="text-primary"/>
      </button>

      {/* Overlay que solo cierra, no navega */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/30 transition-opacity ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white/90 backdrop-blur-lg shadow-xl transform transition-transform z-50 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo: ya NO navega, solo cierra */}
          <h1
            className="text-2xl font-bold text-primary mb-8 cursor-pointer select-none"
            onClick={() => setOpen(false)}
          >
            OpoBoost
          </h1>

          {/* Navegación */}
          <nav className="flex-1 space-y-4">
            {items.map(i => (
              <Link
                key={i.to}
                to={i.to}
                className="flex items-center space-x-3 text-gray-700 hover:text-primary transition"
                onClick={() => setOpen(false)}
              >
                {i.icon}
                <span className="font-medium">{i.label}</span>
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <button
            onClick={() => { logout(); nav('/login'); setOpen(false) }}
            className="mt-6 w-full flex items-center justify-center space-x-2 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
          >
            <LogOut size={20}/>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}
