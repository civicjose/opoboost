// frontend/src/pages/AdminFeedback.jsx
import React, { useState, useEffect } from 'react';
import { getFeedbacks } from '../api/feedback';
import { Bug, Lightbulb, User, Link as LinkIcon, Clock } from 'lucide-react';

export default function AdminFeedback() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFeedbacks = async () => {
            try {
                const res = await getFeedbacks();
                setFeedbacks(res.data);
            } catch (error) {
                console.error("No se pudieron cargar los feedbacks:", error);
            } finally {
                setLoading(false);
            }
        };
        loadFeedbacks();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
    };

    return (
        <div className="relative flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-800 to-blue-600 overflow-hidden pt-24 pb-12 px-4">
            <div className="absolute top-8 left-8 w-40 h-40 bg-white opacity-10 rounded-full animate-float" />
            <div className="absolute bottom-12 right-16 w-72 h-72 bg-white opacity-5 rounded-full" />

            <div className="relative z-10 w-full max-w-4xl space-y-8">
                <h1 className="text-4xl font-extrabold text-white text-center">Buzón de Feedback</h1>

                {loading ? (
                    <p className="text-center text-white">Cargando mensajes...</p>
                ) : feedbacks.length === 0 ? (
                    <div className="bg-white/20 backdrop-blur-lg p-8 rounded-xl text-center">
                        <p className="text-white text-lg">El buzón está vacío. ¡Buen trabajo!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {feedbacks.map(fb => (
                            <div key={fb._id} className="bg-white/20 backdrop-blur-lg p-5 rounded-xl shadow-lg border-l-4"
                                 style={{ borderColor: fb.type === 'bug' ? '#F87171' : '#60A5FA' }}>
                                
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        {fb.type === 'bug' ? <Bug className="text-red-400"/> : <Lightbulb className="text-blue-400"/>}
                                        <span className={`font-bold ${fb.type === 'bug' ? 'text-red-400' : 'text-blue-400'}`}>
                                            {fb.type.charAt(0).toUpperCase() + fb.type.slice(1)}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-400 flex items-center gap-2">
                                        <Clock size={14}/> {formatDate(fb.createdAt)}
                                    </div>
                                </div>

                                <p className="text-white my-4">{fb.message}</p>

                                <div className="text-xs text-gray-400 flex justify-between items-center border-t border-white/10 pt-3 mt-3">
                                    <div className="flex items-center gap-2"><User size={14}/> {fb.user?.name || 'Usuario eliminado'} ({fb.user?.email})</div>
                                    <div className="flex items-center gap-2"><LinkIcon size={14}/> Página: <span className="font-mono">{fb.page}</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}