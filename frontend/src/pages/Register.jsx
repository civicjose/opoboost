import React, { useState, useMemo } from 'react';
import { UserPlus, MailCheck, CheckCircle, XCircle } from 'lucide-react';
import api from '../api/auth';
import { useNavigate } from 'react-router-dom';
import LogoWhite from '../components/LogoWhite';

// --- Componente para la Barra de Seguridad ---
const PasswordStrengthBar = ({ score }) => {
    const width = `${(score / 3) * 100}%`;
    const color = () => {
        if (score === 3) return 'bg-green-500'; // Fuerte
        if (score === 2) return 'bg-yellow-500'; // Media
        if (score === 1) return 'bg-red-500'; // Débil
        return 'bg-gray-300'; // Vacía
    };

    return (
        <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
            <div
                className={`h-2 rounded-full transition-all duration-300 ${color()}`}
                style={{ width }}
            />
        </div>
    );
};

export default function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '' // <-- Nuevo campo
  });
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  // --- Lógica para la Validación de Contraseña ---
  const passwordValidation = useMemo(() => {
    const password = form.password;
    const hasLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    
    let score = 0;
    if (hasLength) score++;
    if (hasNumber) score++;
    if (hasLetter) score++;
    
    return {
      score,
      hasLength,
      hasNumber,
      hasLetter,
    };
  }, [form.password]);

  const isPasswordSecure = passwordValidation.score === 3;
  const passwordsMatch = form.password && form.password === form.confirmPassword;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!isPasswordSecure) {
        setError('La contraseña no cumple los requisitos de seguridad.');
        return;
    }
    if (!passwordsMatch) {
        setError('Las contraseñas no coinciden.');
        return;
    }
    setError(''); // Limpiar errores antes de enviar

    try {
      await api.post('/auth/register', {
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        password: form.password
      });
      setIsSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error en el registro');
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prevForm => ({
        ...prevForm,
        [name]: value
    }));
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-bl from-secondary to-primary">
      <div className="absolute top-16 right-16 w-56 h-56 bg-white opacity-10 rounded-full animate-float" />
      <div className="absolute bottom-28 left-8 w-64 h-64 bg-white opacity-5 rounded-full" />

      <div className="relative z-10 w-full max-w-md p-4">
        <div className="flex justify-center mb-6">
          <LogoWhite height="150" />
        </div>

        <div className="bg-white bg-opacity-80 backdrop-blur-lg p-8 rounded-2xl shadow-xl">
          {isSuccess ? (
            <div className="text-center">
              <MailCheck size={48} className="mx-auto text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Registro completado!</h2>
              <p className="text-gray-600 mb-6">Hemos enviado un correo de bienvenida a tu email. Tu cuenta está ahora pendiente de validación por un administrador.</p>
              <button onClick={() => navigate('/login')} className="w-full py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition">
                Volver a Iniciar Sesión
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-4"><UserPlus size={32} className="text-secondary" /></div>
              <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">Crea tu cuenta</h2>
              {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg text-center mb-4">{error}</p>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input type="text" name="firstName" required value={form.firstName} onChange={handleInputChange} className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary transition"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Apellidos</label>
                    <input type="text" name="lastName" required value={form.lastName} onChange={handleInputChange} className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary transition"/>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                  <input type="email" name="email" required value={form.email} onChange={handleInputChange} className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary transition"/>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                  <input type="password" name="password" required value={form.password} onChange={handleInputChange} className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary transition"/>
                  <PasswordStrengthBar score={passwordValidation.score} />
                  <ul className="text-xs text-gray-600 mt-2 space-y-1">
                      <li className={`flex items-center gap-2 ${passwordValidation.hasLength ? 'text-green-600' : ''}`}><CheckCircle size={14} /> Mínimo 8 caracteres</li>
                      <li className={`flex items-center gap-2 ${passwordValidation.hasNumber ? 'text-green-600' : ''}`}><CheckCircle size={14} /> Incluye un número</li>
                      <li className={`flex items-center gap-2 ${passwordValidation.hasLetter ? 'text-green-600' : ''}`}><CheckCircle size={14} /> Incluye letras</li>
                  </ul>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                  <input type="password" name="confirmPassword" required value={form.confirmPassword} onChange={handleInputChange} className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary transition"/>
                  {form.confirmPassword && (passwordsMatch ? <p className="text-xs text-green-600 mt-1">Las contraseñas coinciden.</p> : <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden.</p>)}
                </div>

                <button type="submit" className="w-full py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition">
                  Registrarse
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <button onClick={() => navigate('/login')} className="text-secondary font-medium hover:underline">
                  Accede aquí
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}