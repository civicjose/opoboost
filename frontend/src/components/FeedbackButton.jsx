// frontend/src/components/FeedbackButton.jsx
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, X } from 'lucide-react';
import { submitFeedback } from '../api/feedback';

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState('sugerencia');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'sending', 'success', 'error'
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim().length < 10) {
      alert("Por favor, danos un poco más de detalle (mínimo 10 caracteres).");
      return;
    }

    setStatus('sending');
    try {
      await submitFeedback({
        type,
        message,
        page: location.pathname
      });
      setStatus('success');
      setMessage('');
      setTimeout(() => {
        setIsOpen(false);
        setStatus('idle'); // Resetear para la próxima vez que se abra
      }, 2000);
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <>
      {/* Botón Flotante */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-secondary text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-secondary/80 transition-transform hover:scale-110 z-40"
        title="Enviar sugerencia o reportar bug"
      >
        <MessageSquare size={28} />
      </button>

      {/* Modal con el Formulario */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
            <div className="relative bg-gray-800 text-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-white/20">
                <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                
                <h2 className="text-2xl font-bold mb-4">Envíanos tu opinión</h2>
                <p className="text-gray-300 mb-6">Tu feedback es muy valioso para mejorar OpoBoost.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-4">
                        <button type="button" onClick={() => setType('sugerencia')} className={`flex-1 p-3 rounded-lg border-2 transition ${type === 'sugerencia' ? 'bg-blue-500 border-transparent' : 'border-gray-600 hover:border-gray-500'}`}>Sugerencia</button>
                        <button type="button" onClick={() => setType('bug')} className={`flex-1 p-3 rounded-lg border-2 transition ${type === 'bug' ? 'bg-red-500 border-transparent' : 'border-gray-600 hover:border-gray-500'}`}>Reportar Bug</button>
                    </div>
                    
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={type === 'sugerencia' ? "¿Qué mejorarías? ¿Qué echas en falta?" : "Describe el error que has encontrado y qué hacías cuando ocurrió."}
                        className="w-full bg-gray-700 p-3 rounded-lg h-32"
                        required
                        minLength={10}
                    />

                    <div className="flex justify-end pt-2">
                        <button type="submit" disabled={status !== 'idle'} className={`px-6 py-2 rounded-lg font-bold transition w-40 h-11 flex items-center justify-center ${
                            status === 'idle' ? 'bg-secondary hover:bg-secondary/90' :
                            status === 'sending' ? 'bg-gray-500' : 
                            status === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                           {status === 'idle' && 'Enviar'}
                           {status === 'sending' && 'Enviando...'}
                           {status === 'success' && '¡Gracias!'}
                           {status === 'error' && 'Error'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </>
  );
}