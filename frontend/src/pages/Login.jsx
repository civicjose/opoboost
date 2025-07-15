import React, { useState, useContext } from 'react';
import { Lock, BookOpen } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LogoWhite from '../components/LogoWhite';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const { login }               = useContext(AuthContext);
  const navigate                = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error en el login');
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-tr from-primary to-secondary">
      {/* Decorativos */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-white opacity-10 rounded-full animate-float" />
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-white opacity-5 rounded-full" />

      <div className="relative z-10 w-full max-w-md p-4">
        {/* Logo / Nombre de la app */}
        <div className="flex items-center justify-center mb-6 space-x-2">
          <div className="flex justify-center mb-6">
          <LogoWhite height="150" />
        </div>
        </div>

        <div className="bg-white bg-opacity-80 backdrop-blur-lg p-8 rounded-2xl shadow-xl">
          <div className="flex justify-center mb-4">
            <Lock size={32} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">Inicia sesión</h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary transition"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary/90 transition"
            >
              Entrar
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-primary font-medium hover:underline"
            >
              Regístrate
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
