import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import api from '../api/auth';
import LogoWhite from '../components/LogoWhite';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.post(`/auth/reset-password/${token}`, { password });
      setMessage(res.data.message + ' Serás redirigido en 3 segundos...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al restablecer la contraseña.');
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-tr from-primary to-secondary">
      <div className="relative z-10 w-full max-w-md p-4">
        <div className="flex justify-center mb-6"><LogoWhite height="150" /></div>
        <div className="bg-white bg-opacity-80 backdrop-blur-lg p-8 rounded-2xl shadow-xl">
          <div className="flex justify-center mb-4"><Lock size={32} className="text-primary" /></div>
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Establecer Nueva Contraseña</h2>

          {message && <p className="text-green-600 bg-green-100 p-3 rounded-lg text-center mb-4">{message}</p>}
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading || message}
              className="w-full py-2 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary/90 transition disabled:opacity-50"
            >
              {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}