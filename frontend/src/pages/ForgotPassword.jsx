import React, { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import api from '../api/auth';
import { useNavigate } from 'react-router-dom';
import LogoWhite from '../components/LogoWhite';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

 const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 429) {
          setError(err.response.data.message);
        } else {
          setError('Ha ocurrido un error. Por favor, inténtalo de nuevo.');
        }
      } else {
        setError('No se pudo conectar con el servidor.');
      }
      // ------------------------------------
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-tr from-primary to-secondary">
      <div className="absolute top-10 left-10 w-40 h-40 bg-white opacity-10 rounded-full animate-float" />
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-white opacity-5 rounded-full" />
      <div className="relative z-10 w-full max-w-md p-4">
        <div className="flex justify-center mb-6"><LogoWhite height="150" /></div>
        <div className="bg-white bg-opacity-80 backdrop-blur-lg p-8 rounded-2xl shadow-xl">
          <div className="flex justify-center mb-4"><Mail size={32} className="text-primary" /></div>
          <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">Recuperar Contraseña</h2>
          <p className="text-center text-gray-600 mb-6">Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.</p>
          
          {message && <p className="text-green-600 bg-green-100 p-3 rounded-lg text-center mb-4">{message}</p>}
          {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg text-center mb-4">{error}</p>}
          
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
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary/90 transition disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-primary font-medium hover:underline flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} /> Volver a Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}