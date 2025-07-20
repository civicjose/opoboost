import React from 'react';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';

const NotificationModal = ({ isOpen, onClose, title, message, type = 'alert' }) => {
    if (!isOpen) return null;

    const Icon = type === 'success' ? CheckCircle : AlertTriangle;
    const iconColor = type === 'success' ? 'text-green-400' : 'text-yellow-400';

    return (
        // --- LA SOLUCIÓN ESTÁ EN ESTA LÍNEA ---
        // Cambiamos z-50 por z-[60] para que siempre esté por encima del otro modal (que tiene z-50)
        <div className="fixed inset-0 flex items-center justify-center z-[60] bg-black/70">
            <div className="relative bg-gray-800 text-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-white/20 text-center">
                <div className="flex justify-center mb-3">
                    <Icon size={40} className={iconColor} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="mb-6 text-gray-300">{message}</p>
                <button
                    onClick={onClose}
                    className="w-full bg-secondary text-white font-semibold rounded-lg py-2 hover:bg-secondary/90 transition"
                >
                    Entendido
                </button>
            </div>
        </div>
    );
};

export default NotificationModal;