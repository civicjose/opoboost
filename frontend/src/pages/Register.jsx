import React, { useState } from 'react';
import { UserPlus, BookOpen } from 'lucide-react';
import api from '../api/auth';
import { useNavigate } from 'react-router-dom';
import LogoWhite from '../components/LogoWhite';

export default function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.post('/auth/register', {
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        password: form.password
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Error en el registro');
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-bl from-secondary to-primary">
      {/* Decorativos */}
      <div className="absolute top-16 right-16 w-56 h-56 bg-white opacity-10 rounded-full animate-float" />
      <div className="absolute bottom-28 left-8 w-64 h-64 bg-white opacity-5 rounded-full" />

      <div className="relative z-10 w-full max-w-md p-4">
        {/* Logo / Nombre de la app */}
        <div className="flex items-center justify-center mb-6 space-x-2">
          <div className="flex justify-center mb-6">
          <LogoWhite height="150" />
        </div>
        </div>

        <div className="bg-white bg-opacity-80 backdrop-blur-lg p-8 rounded-2xl shadow-xl">
          <div className="flex justify-center mb-4">
            <UserPlus size={32} className="text-secondary" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">Crea tu cuenta</h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  required
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Apellidos</label>
                <input
                  type="text"
                  required
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition"
            >
              Registrarse
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-secondary font-medium hover:underline"
            >
              Accede aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
