import React, { useState, useEffect, useMemo } from 'react';
import { getCategories } from '../api/categories';
import { getTestDefsByCategory, getTestDefinitionById, addQuestionToTest } from '../api/tests';
import { updateQuestion, deleteQuestion } from '../api/questions';
import { Edit, Trash2, PlusCircle, X, Check, Search, ArrowUpDown } from 'lucide-react';
import NotificationModal from '../components/NotificationModal'; // <-- 1. IMPORTAMOS EL MODAL

// --- Componente Modal y QuestionEditor (sin cambios) ---
const Modal = ({ children, onClose }) => ( <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70"> <div className="relative bg-gray-800 text-white rounded-2xl p-6 w-full max-w-2xl shadow-xl border border-white/20"> <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button> {children} </div> </div> );
const QuestionEditor = ({ questionData, onSave, onCancel }) => { const [question, setQuestion] = useState(questionData); const handleInputChange = (e, index) => { if (index !== undefined) { const newOptions = [...question.options]; newOptions[index] = { ...newOptions[index], text: e.target.value }; setQuestion({ ...question, options: newOptions }); } else { setQuestion({ ...question, [e.target.name]: e.target.value }); } }; const handleCorrectChange = (index) => { setQuestion({ ...question, correct: index }); }; const handleSubmit = (e) => { e.preventDefault(); onSave(question); }; return ( <form onSubmit={handleSubmit} className="space-y-4"> <h2 className="text-2xl font-bold mb-6">{questionData._id ? 'Editar Pregunta' : 'Nueva Pregunta'}</h2> <div> <label className="block mb-2 font-semibold">Texto de la pregunta:</label> <textarea name="text" value={question.text} onChange={handleInputChange} className="w-full bg-gray-700 p-3 rounded-lg h-24"/> </div> <div> <label className="block mb-2 font-semibold">Opciones (marca la correcta):</label> <div className="space-y-2"> {question.options.map((opt, index) => ( <div key={index} className="flex items-center gap-2"> <input type="text" value={opt.text} onChange={(e) => handleInputChange(e, index)} className="flex-grow bg-gray-700 p-2 rounded-lg"/> <button type="button" onClick={() => handleCorrectChange(index)} className={`p-2 rounded-full transition ${question.correct === index ? 'bg-green-500' : 'bg-gray-600 hover:bg-gray-500'}`}><Check size={20}/></button> </div> ))} </div> </div> <div className="flex justify-end gap-4 pt-4"> <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-500">Cancelar</button> <button type="submit" className="px-6 py-2 bg-secondary rounded-lg font-bold">Guardar Cambios</button> </div> </form> ); };

export default function AdminQuestions() {
    // --- Lógica y hooks (con nuevo estado) ---
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [tests, setTests] = useState([]);
    const [selectedTest, setSelectedTest] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState({ cats: true, tests: false, questions: false });
    const [modal, setModal] = useState({ type: null, data: null });
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'text', direction: 'ascending' });
    const [modalInfo, setModalInfo] = useState({ isOpen: false, title: '', message: '', type: 'alert' }); // <-- 2. AÑADIMOS ESTADO PARA NOTIFICACIONES

    // --- Hooks de datos (sin cambios) ---
    const loadQuestions = async (testId) => { if (!testId) { setQuestions([]); return; } setLoading(prev => ({ ...prev, questions: true })); try { const res = await getTestDefinitionById(testId); setQuestions(res.data.questions); } catch (error) { console.error("Error cargando preguntas:", error); } finally { setLoading(prev => ({ ...prev, questions: false })); } };
    useEffect(() => { const loadCategories = async () => { try { const res = await getCategories(); setCategories(res.data); } catch (e) { console.error(e); } finally { setLoading(prev => ({ ...prev, cats: false })); } }; loadCategories(); }, []);
    useEffect(() => { if (!selectedCategory) { setTests([]); setSelectedTest(''); setQuestions([]); return; } const loadTests = async () => { setLoading(prev => ({ ...prev, tests: true })); const res = await getTestDefsByCategory(selectedCategory); setTests(res.data); setLoading(prev => ({ ...prev, tests: false })); }; loadTests(); }, [selectedCategory]);
    useEffect(() => { loadQuestions(selectedTest); }, [selectedTest]);
    
    // --- Lógica de filtrado y ordenación (sin cambios) ---
    const sortedAndFilteredQuestions = useMemo(() => { let filteredQuestions = [...questions]; if (searchTerm) { filteredQuestions = filteredQuestions.filter(q => q.text.toLowerCase().includes(searchTerm.toLowerCase())); } if (sortConfig.key !== null) { filteredQuestions.sort((a, b) => { if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1; if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1; return 0; }); } return filteredQuestions; }, [questions, searchTerm, sortConfig]);
    const requestSort = (key) => { let direction = 'ascending'; if (sortConfig.key === key && sortConfig.direction === 'ascending') { direction = 'descending'; } setSortConfig({ key, direction }); };
    const SortableHeader = ({ label, sortKey, className = '' }) => ( <div className={`p-4 font-semibold cursor-pointer flex items-center ${className}`} onClick={() => requestSort(sortKey)}> {label} <ArrowUpDown className="inline-block ml-1" size={14} /> </div> );

    // --- FUNCIONES MODIFICADAS SIN ALERTS ---
    const handleSaveQuestion = async (questionData) => {
        try {
            if (modal.type === 'edit') {
                await updateQuestion(modal.data._id, questionData);
            } else {
                await addQuestionToTest(selectedTest, questionData);
            }
            loadQuestions(selectedTest);
            setModal({ type: null, data: null });
        } catch (error) {
            setModal({ type: null, data: null }); // Cerramos el modal de edición
            setModalInfo({ isOpen: true, title: 'Error', message: 'No se pudo guardar la pregunta.' });
        }
    };
    
    const handleDeleteQuestion = async () => {
        if (!modal.data) return;
        try {
            await deleteQuestion(modal.data._id);
            setModal({ type: null, data: null });
            loadQuestions(selectedTest);
            setModalInfo({ isOpen: true, title: 'Eliminada', message: 'La pregunta ha sido eliminada.', type: 'success' });
        } catch (error) {
            setModal({ type: null, data: null });
            setModalInfo({ isOpen: true, title: 'Error', message: 'No se pudo eliminar la pregunta.' });
        }
    };

    return (
        <div className="relative flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-800 to-blue-600 overflow-hidden pt-24 pb-12 px-4">
            {/* --- 3. RENDERIZAMOS EL MODAL DE NOTIFICACIÓN --- */}
            <NotificationModal {...modalInfo} onClose={() => setModalInfo({ isOpen: false, title: '', message: '' })} />

            <div className="relative z-10 w-full max-w-6xl space-y-8">
                <h1 className="text-4xl font-extrabold text-white">Editor de Tests y Preguntas</h1>
                <div className="grid md:grid-cols-2 gap-6">
                    <select onChange={e => setSelectedCategory(e.target.value)} value={selectedCategory} className="bg-white/20 text-white p-3 rounded-lg border-2 border-transparent focus:border-white focus:outline-none transition"> <option value="" className="text-black">1. Selecciona una categoría...</option> {categories.map(c => <option key={c._id} value={c._id} className="text-black">{c.name}</option>)} </select>
                    <select onChange={e => setSelectedTest(e.target.value)} value={selectedTest} disabled={!selectedCategory || loading.tests} className="bg-white/20 text-white p-3 rounded-lg border-2 border-transparent focus:border-white focus:outline-none transition disabled:opacity-50"> <option value="" className="text-black">2. Selecciona un test...</option> {tests.map(t => <option key={t._id} value={t._id} className="text-black">{t.title}</option>)} </select>
                </div>

                {selectedTest && (
                    <div className="bg-white/20 backdrop-blur-lg rounded-xl shadow-lg">
                        <div className="flex flex-col md:flex-row justify-between items-center p-4 gap-4 border-b border-white/10">
                            <h2 className="text-xl font-semibold text-white">Preguntas ({questions.length})</h2>
                            <div className="w-full md:w-auto flex-grow md:max-w-xs relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" size={20}/>
                                <input type="text" placeholder="Buscar pregunta..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-black/20 text-white placeholder-white/70 p-2 pl-10 rounded-lg border-2 border-transparent focus:border-white focus:outline-none transition"/>
                            </div>
                            <button onClick={() => setModal({type: 'create', data: { text: '', options: [{text:''},{text:''},{text:''},{text:''}], correct: 0 }})} className="flex-shrink-0 flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition"><PlusCircle size={20}/>Añadir</button>
                        </div>
                        
                        <div className="text-white">
                            <div className="hidden md:grid md:grid-cols-12 items-center bg-black/20">
                                <div className="col-span-9"><SortableHeader label="Pregunta" sortKey="text" className="hover:bg-white/10" /></div>
                                <div className="p-4 col-span-3 text-right font-semibold">Acciones</div>
                            </div>
                            <div className="flex flex-col md:gap-0">
                                {loading.questions ? (<p className="text-center p-8">Cargando...</p>) : 
                                sortedAndFilteredQuestions.map((q, index) => (
                                    <div key={q._id} className={`md:grid md:grid-cols-12 md:items-center p-4 md:p-0 md:border-b md:border-white/10 ${index === sortedAndFilteredQuestions.length - 1 ? 'md:border-b-0' : ''}`}>
                                        <div className="md:p-4 md:col-span-9">{q.text}</div>
                                        <div className="md:p-4 md:col-span-3 mt-4 md:mt-0 flex justify-end gap-2">
                                            <button onClick={() => setModal({type: 'edit', data: q})} className="p-2 rounded-md bg-yellow-500 text-black hover:bg-yellow-400 transition" title="Editar Pregunta"><Edit size={16}/></button>
                                            <button onClick={() => setModal({type: 'delete', data: q})} className="p-2 rounded-md bg-red-600 hover:bg-red-500 transition" title="Eliminar Pregunta"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Modales de acción (sin cambios) */}
            {modal.type && modal.type !== 'delete' && ( <Modal onClose={() => setModal({ type: null, data: null })}> <QuestionEditor questionData={modal.data} onSave={handleSaveQuestion} onCancel={() => setModal({ type: null, data: null })} /> </Modal> )}
            {modal.type === 'delete' && ( <Modal onClose={() => setModal({ type: null, data: null })}> <h2 className="text-2xl font-bold mb-4 text-red-400">Confirmar Eliminación</h2> <p>¿Seguro que quieres borrar la pregunta <strong className="font-bold">"{modal.data.text}"</strong> permanentemente?</p> <p className="mt-2 text-yellow-400">Esta acción no se puede deshacer.</p> <div className="flex justify-end gap-4 mt-6"> <button onClick={() => setModal({ type: null, data: null })} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500">Cancelar</button> <button onClick={handleDeleteQuestion} className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500 font-bold">Sí, Eliminar</button> </div> </Modal> )}
        </div>
    );
}