// frontend/src/pages/AdminQuestions.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { getAllQuestions, updateQuestion } from '../api/questions';
import { Search, Edit as EditIcon, X, Check } from 'lucide-react';

const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-60" onClick={onClose} />
      <div className="relative bg-gray-800 text-white rounded-2xl p-6 w-full max-w-2xl shadow-xl border border-white/20">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
        {children}
      </div>
    </div>
);

export default function AdminQuestions() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // State para el modal de edición
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getAllQuestions();
            setQuestions(res.data);
        } catch (error) {
            console.error("Error cargando preguntas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEditClick = (question) => {
        setEditingQuestion({ ...question });
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingQuestion(null);
    };

    const handleInputChange = (e, index) => {
        if (index !== undefined) { // Es una opción
            const newOptions = [...editingQuestion.options];
            newOptions[index] = { ...newOptions[index], text: e.target.value };
            setEditingQuestion({ ...editingQuestion, options: newOptions });
        } else { // Es el texto de la pregunta
            setEditingQuestion({ ...editingQuestion, [e.target.name]: e.target.value });
        }
    };
    
    const handleCorrectChange = (index) => {
        setEditingQuestion({ ...editingQuestion, correct: index });
    };

    const handleSaveChanges = async () => {
        try {
            await updateQuestion(editingQuestion._id, editingQuestion);
            handleModalClose();
            fetchData(); // Recargar los datos para ver los cambios
            alert('¡Pregunta actualizada con éxito!');
        } catch (error) {
            console.error("Error al guardar los cambios:", error);
            alert('Hubo un error al guardar. Inténtalo de nuevo.');
        }
    };

    const filteredQuestions = useMemo(() =>
        questions.filter(q => 
            q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.topicTitle.toLowerCase().includes(searchTerm.toLowerCase())
        ),
    [questions, searchTerm]);

    return (
        <div className="relative flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-800 to-blue-600 overflow-hidden pt-24 pb-12 px-4">
            <div className="relative z-10 w-full max-w-6xl space-y-8">
                <h1 className="text-4xl font-extrabold text-white">Gestión de Preguntas</h1>
                
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" size={20}/>
                    <input type="text" placeholder="Buscar por texto o tema..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white/20 text-white placeholder-white/70 p-3 pl-10 rounded-lg border-2 border-transparent focus:border-white focus:outline-none transition"/>
                </div>

                <div className="overflow-x-auto bg-white/20 backdrop-blur-lg rounded-xl shadow-lg">
                    <table className="w-full text-white">
                        <thead className="bg-black/20"><tr><th className="p-4 text-left">Pregunta</th><th className="p-4 text-left">Tema</th><th className="p-4 text-center">Acción</th></tr></thead>
                        <tbody>
                            {loading ? (<tr><td colSpan="3" className="text-center p-8">Cargando preguntas...</td></tr>) : 
                            (filteredQuestions.map(q => (
                                <tr key={q._id} className="border-b border-white/10">
                                    <td className="p-4 w-2/3">{q.text}</td>
                                    <td className="p-4">{q.topicTitle}</td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => handleEditClick(q)} className="flex items-center gap-1 bg-yellow-500 text-black px-3 py-1.5 rounded-md hover:bg-yellow-400 transition text-sm font-semibold"><EditIcon size={14}/> Editar</button>
                                    </td>
                                </tr>
                            )))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && editingQuestion && (
                <Modal onClose={handleModalClose}>
                    <h2 className="text-2xl font-bold mb-6">Editar Pregunta</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block mb-2 font-semibold">Texto de la pregunta:</label>
                            <textarea name="text" value={editingQuestion.text} onChange={handleInputChange} className="w-full bg-gray-700 p-3 rounded-lg h-24"/>
                        </div>
                        <div>
                            <label className="block mb-2 font-semibold">Opciones:</label>
                            <div className="space-y-2">
                                {editingQuestion.options.map((opt, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input type="text" value={opt.text} onChange={(e) => handleInputChange(e, index)} className="flex-grow bg-gray-700 p-2 rounded-lg"/>
                                        <button onClick={() => handleCorrectChange(index)} className={`p-2 rounded-full transition ${editingQuestion.correct === index ? 'bg-green-500' : 'bg-gray-600 hover:bg-gray-500'}`}>
                                            <Check size={20}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button onClick={handleSaveChanges} className="w-full bg-secondary py-3 rounded-lg font-bold mt-6">Guardar Cambios</button>
                    </div>
                </Modal>
            )}
        </div>
    );
}