// frontend/src/pages/AdminFeedback.jsx
import React, { useState, useEffect } from 'react';
import { getFeedbacks, replyToFeedback } from '../api/feedback';
import { Bug, Lightbulb, User, Link as LinkIcon, Clock, Send, MessageSquare, CheckCircle, X } from 'lucide-react';
// --- NUEVO Modal para la Respuesta ---
const ReplyModal = ({ feedback, onClose, onSend }) => {
    const [replyMessage, setReplyMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!replyMessage.trim()) return;
        setLoading(true);
        await onSend(feedback._id, replyMessage);
        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
            <div className="relative bg-gray-800 text-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-white/20">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                <h2 className="text-2xl font-bold mb-4">Responder a {feedback.user.name}</h2>
                <div className="bg-black/20 p-3 rounded-lg mb-4">
                    <p className="text-sm font-semibold text-gray-300">Mensaje original:</p>
                    <p className="text-sm text-gray-400"><i>"{feedback.message}"</i></p>
                </div>
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Escribe tu respuesta aquí..."
                        className="w-full bg-gray-700 p-3 rounded-lg h-32"
                        required
                    />
                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-secondary text-white rounded-lg font-bold flex items-center gap-2 hover:bg-secondary/90 transition disabled:opacity-50">
                            {loading ? 'Enviando...' : <><Send size={16}/> Enviar Respuesta</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function AdminFeedback() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFeedback, setSelectedFeedback] = useState(null); // Para el modal

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

    useEffect(() => { loadFeedbacks(); }, []);

    const handleSendReply = async (feedbackId, replyMessage) => {
        try {
            await replyToFeedback(feedbackId, replyMessage);
            // Recargamos los feedbacks para ver el estado "respondido"
            loadFeedbacks();
        } catch (error) {
            alert(error.response?.data?.message || "Error al enviar la respuesta.");
        }
    };
    
    const formatDate = (dateString) => new Date(dateString).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });

    return (
        <div className="relative flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-800 to-blue-600 overflow-hidden pt-24 pb-12 px-4">
            <div className="absolute top-8 left-8 w-40 h-40 bg-white opacity-10 rounded-full animate-float" />
            <div className="absolute bottom-12 right-16 w-72 h-72 bg-white opacity-5 rounded-full" />
            <div className="relative z-10 w-full max-w-4xl space-y-8">
                <h1 className="text-4xl font-extrabold text-white text-center">Buzón de Feedback</h1>
                {loading ? <p className="text-center text-white">Cargando mensajes...</p> : 
                feedbacks.length === 0 ? <div className="bg-white/20 backdrop-blur-lg p-8 rounded-xl text-center"><p className="text-white text-lg">El buzón está vacío. ¡Buen trabajo!</p></div> : 
                <div className="space-y-4">
                    {feedbacks.map(fb => (
                        <div key={fb._id} className="bg-white/20 backdrop-blur-lg p-5 rounded-xl shadow-lg border-l-4" style={{ borderColor: fb.type === 'bug' ? '#F87171' : '#60A5FA' }}>
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    {fb.type === 'bug' ? <Bug className="text-red-400"/> : <Lightbulb className="text-blue-400"/>}
                                    <span className={`font-bold ${fb.type === 'bug' ? 'text-red-400' : 'text-blue-400'}`}>{fb.type.charAt(0).toUpperCase() + fb.type.slice(1)}</span>
                                    {fb.replied && <span className="text-xs flex items-center gap-1 bg-green-500/20 text-green-300 px-2 py-1 rounded-full"><CheckCircle size={14}/> Respondido</span>}
                                </div>
                                <div className="text-xs text-gray-400 flex items-center gap-2"><Clock size={14}/> {formatDate(fb.createdAt)}</div>
                            </div>
                            <p className="text-white my-4">{fb.message}</p>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-t border-white/10 pt-3 mt-3">
                                <div className="text-xs text-gray-400 flex flex-col gap-1">
                                    <div className="flex items-center gap-2"><User size={14}/> {fb.user?.name || 'Usuario eliminado'} ({fb.user?.email || 'N/A'})</div>
                                    <div className="flex items-center gap-2"><LinkIcon size={14}/> Página: <span className="font-mono">{fb.page}</span></div>
                                </div>
                                {!fb.replied && (
                                    <button onClick={() => setSelectedFeedback(fb)} className="w-full md:w-auto flex items-center justify-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition text-sm">
                                        <MessageSquare size={16}/> Responder
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                }
            </div>
            {selectedFeedback && <ReplyModal feedback={selectedFeedback} onClose={() => setSelectedFeedback(null)} onSend={handleSendReply} />}
        </div>
    );
}