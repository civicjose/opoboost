import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const nav = useNavigate();

  return (
    <header className="bg-white shadow-md fixed top-0 w-full z-30">
      <nav className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <div
          className="text-2xl font-bold text-brand cursor-pointer"
          onClick={() => nav('/')}
        >
          OpoBoost
        </div>
        <ul className="flex space-x-6 items-center">
          <li><Link className="hover:text-brand" to="/">Inicio</Link></li>
          {user && (user.role !== 'alumno') && (
            <li><Link className="hover:text-brand" to="/admin/topics">Temas</Link></li>
          )}
          {user && (
            <li><Link className="hover:text-brand" to="/test">Simulacro</Link></li>
          )}
        </ul>
        <div className="flex space-x-4">
          {!user ? (
            <>
              <button
                onClick={() => nav('/login')}
                className="px-4 py-2 rounded-md border border-brand text-brand hover:bg-brand hover:text-white transition"
              >
                Acceder
              </button>
              <button
                onClick={() => nav('/register')}
                className="px-4 py-2 rounded-md bg-brand text-white hover:bg-brand-dark transition"
              >
                Registrarse
              </button>
            </>
          ) : (
            <button
              onClick={() => { logout(); nav('/login'); }}
              className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
            >
              Cerrar sesión
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
