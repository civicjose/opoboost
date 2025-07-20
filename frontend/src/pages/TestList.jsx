import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { getCategoryById } from '../api/categories';
import { createTestDefinition, updateTestDefinition, importQuestionsToTest, deleteTest } from '../api/tests';
import api from '../api/auth';
import { PlusCircle, Edit, FileJson, Search, ChevronRight, X, Trash2, ArrowUpDown, MoreVertical } from 'lucide-react';
import NotificationModal from '../components/NotificationModal';

const Modal = ({ children, onClose }) => ( <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70"> <div className="relative bg-gray-800 text-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-white/20"> <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button> {children} </div> </div> );
const TestActions = ({ test, onImport, onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    useEffect(() => { const handleClickOutside = (event) => { if (menuRef.current && !menuRef.current.contains(event.target)) { setIsOpen(false); } }; document.addEventListener('mousedown', handleClickOutside); return () => document.removeEventListener('mousedown', handleClickOutside); }, []);
    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(o => !o)} className="p-2 rounded-full hover:bg-white/20 transition" title="Más opciones"><MoreVertical size={20} /></button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-white/20 rounded-lg shadow-lg z-10">
                    <button onClick={() => { onImport(test); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-gray-700"><FileJson size={16} /> Importar</button>
                    <button onClick={() => { onEdit(test); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-gray-700"><Edit size={16} /> Editar</button>
                    <button onClick={() => { onDelete(test); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-gray-700"><Trash2 size={16} /> Eliminar</button>
                </div>
            )}
        </div>
    );
};

export default function TestList() {
    const { cat } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [category, setCategory] = useState(null);
    const [tests, setTests] = useState([]);
    const [progress, setProgress] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'ascending' });
    const [modalState, setModalState] = useState({ type: null, test: null });
    const [newTitle, setNewTitle] = useState('');
    const [importJson, setImportJson] = useState('');
    const [modalInfo, setModalInfo] = useState({ isOpen: false, title: '', message: '', type: 'alert' });

    const fetchData = async () => { try { setLoading(true); const catRes = await getCategoryById(cat); setCategory(catRes.data); const testsRes = await api.get(`/tests/category-stats/${cat}`); setTests(testsRes.data.tests); setProgress(testsRes.data.progress); } catch (error) { console.error("Error al cargar la lista de tests:", error); navigate('/categories'); } finally { setLoading(false); } };
    useEffect(() => { const checkAccessAndFetch = async () => { if (!user) return; if (user.role === 'profesor' || user.role === 'administrador') { fetchData(); return; } try { const permissionsRes = await api.get('/users/my-permissions'); const permittedCategoryIds = permissionsRes.data; if (permittedCategoryIds.includes(cat)) { fetchData(); } else { navigate('/categories'); } } catch (error) { navigate('/'); } }; checkAccessAndFetch(); }, [cat, user]);
    const sortedAndFilteredTests = useMemo(() => { let sortableTests = [...tests]; if (sortConfig.key !== null) { sortableTests.sort((a, b) => { if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1; if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1; return 0; }); } return sortableTests.filter(test => test.title.toLowerCase().includes(searchTerm.toLowerCase())); }, [tests, searchTerm, sortConfig]);
    const requestSort = (key) => { let direction = 'ascending'; if (sortConfig.key === key && sortConfig.direction === 'ascending') { direction = 'descending'; } setSortConfig({ key, direction }); };
    const openModal = (type, test = null) => { setModalState({ type, test }); if (type === 'edit') setNewTitle(test?.title || ''); if (type === 'create') setNewTitle(''); if (type === 'import') setImportJson(''); };
    const closeModal = () => { setModalState({ type: null, test: null }); };
    const handleConfirmStartTest = (testMode) => { if (!modalState.test) return; navigate(`/categories/${cat}/${modalState.test._id}?mode=${testMode}`); closeModal(); };
    const handleCreateTest = async () => { if (!newTitle.trim()) { setModalInfo({ isOpen: true, title: 'Campo Requerido', message: 'El título del test no puede estar vacío.' }); return; } await createTestDefinition(cat, newTitle); closeModal(); fetchData(); };
    const handleEditTest = async () => { if (!newTitle.trim() || !modalState.test) return; await updateTestDefinition(modalState.test._id, { title: newTitle }); closeModal(); fetchData(); };
    const handleImportQuestions = async () => { if (!importJson.trim() || !modalState.test) return; try { const questionsArray = JSON.parse(importJson); await importQuestionsToTest(modalState.test._id, questionsArray); setModalInfo({ isOpen: true, title: 'Éxito', message: 'Las preguntas se han importado correctamente.', type: 'success' }); closeModal(); fetchData(); } catch (e) { setModalInfo({ isOpen: true, title: 'Error de Formato', message: 'El texto introducido no es un JSON válido. Por favor, revísalo.' }); } };
    const handleDeleteTest = async () => { if (!modalState.test) return; try { await deleteTest(modalState.test._id); setModalInfo({ isOpen: true, title: 'Eliminado', message: 'El test ha sido eliminado correctamente.', type: 'success' }); closeModal(); fetchData(); } catch (error) { setModalInfo({ isOpen: true, title: 'Error', message: 'No se pudo eliminar el test. Inténtalo de nuevo.' }); } };
    const getRowClass = (score) => { const baseClasses = 'border-l-4 md:border-l-0'; if (score === 0) return 'bg-white/10'; if (score >= 5) return `bg-green-500/20 hover:bg-green-500/30 ${baseClasses} border-green-500/50`; return `bg-red-500/20 hover:bg-red-500/30 ${baseClasses} border-red-500/50`; };
    const SortableHeader = ({ label, sortKey, className = '' }) => ( <div className={`p-4 font-semibold cursor-pointer flex items-center ${className}`} onClick={() => requestSort(sortKey)}> {label} <ArrowUpDown className="inline-block ml-1" size={14} /> </div> );

    return (
        <div className="relative flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-800 to-blue-600 overflow-hidden pt-24 pb-12 px-4">
            <NotificationModal {...modalInfo} onClose={() => setModalInfo({ isOpen: false, title: '', message: '' })} />
            <div className="absolute top-8 left-8 w-40 h-40 bg-white opacity-10 rounded-full animate-float" />
            <div className="absolute bottom-12 right-16 w-72 h-72 bg-white opacity-5 rounded-full" />
            <div className="relative z-10 w-full max-w-6xl space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4"> <h1 className="text-4xl font-extrabold text-white">Tests de {category?.name || '...'}</h1> {(user.role === 'profesor' || user.role === 'administrador') && (<button onClick={() => openModal('create')} className="flex items-center space-x-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition"><PlusCircle size={20} /><span>Crear Test</span></button>)} </div>
                <div className="space-y-6"> <div className="bg-white/20 backdrop-blur-lg p-4 rounded-xl"><h3 className="text-white font-semibold mb-2">Progreso en la Categoría</h3><div className="w-full bg-black/20 rounded-full h-4"><div className="h-4 bg-green-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div></div><p className="text-right text-white text-sm mt-1">{progress}% Aprobado</p></div> <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70" size={20} /><input type="text" placeholder="Buscar test..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full h-full bg-white/20 text-white placeholder-white/70 p-3 pl-12 rounded-xl border-2 border-transparent focus:border-white focus:outline-none transition" /></div> </div>
                
                <div className="bg-white/20 backdrop-blur-lg rounded-xl shadow-lg text-white">
                    <div className="hidden md:grid md:grid-cols-12 items-center bg-black/20 rounded-t-xl">
                        <div className="col-span-6"><SortableHeader label="Título" sortKey="title" /></div>
                        <div className="col-span-2 flex justify-center"><SortableHeader label="Intentos" sortKey="userAttemptsCount" /></div>
                        <div className="col-span-2 flex justify-center"><SortableHeader label="Nota Máx." sortKey="highestScore" /></div>
                        <div className="col-span-2 p-4 font-semibold text-right">Acciones</div>
                    </div>
                    <div className="flex flex-col md:gap-0">
                         {loading ? (<p className="text-center p-8">Cargando...</p>) :
                            sortedAndFilteredTests.map((test, index) => (
                                <div key={test._id} className={`md:grid md:grid-cols-12 md:items-center p-4 md:p-0 transition-colors md:border-b md:border-white/10 ${index === sortedAndFilteredTests.length - 1 ? 'md:border-b-0 md:rounded-b-xl' : ''} ${getRowClass(test.highestScore)}`}>
                                    <div className="md:col-span-6 md:p-4 font-medium truncate" title={test.title}>{test.title}</div>
                                    <div className="mt-2 md:mt-0 md:col-span-2 flex justify-between md:justify-center items-center"><span className="font-semibold text-gray-300 md:hidden">Intentos:</span><span>{test.userAttemptsCount}</span></div>
                                    <div className="mt-2 md:mt-0 md:col-span-2 flex justify-between md:justify-center items-center"><span className="font-semibold text-gray-300 md:hidden">Nota Máxima:</span><span className="font-bold">{test.highestScore.toFixed(2)}</span></div>
                                    <div className="mt-4 md:mt-0 md:col-span-2 flex justify-end items-center gap-2 md:p-4">
                                        <button onClick={() => openModal('startOptions', test)} className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary/80 transition">
                                            <span>Realizar</span>
                                            <ChevronRight size={16} className="hidden sm:inline" />
                                        </button>
                                        {(user.role === 'profesor' || user.role === 'administrador') && (
                                            <TestActions 
                                                test={test} 
                                                onImport={() => openModal('import', test)}
                                                onEdit={() => openModal('edit', test)}
                                                onDelete={() => openModal('delete', test)}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>

            {modalState.type === 'startOptions' && (<Modal onClose={closeModal}><h2 className="text-2xl font-bold mb-4">Modo de Examen</h2><p className="mb-6 text-gray-300">Elige cómo quieres empezar.</p><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><button onClick={() => handleConfirmStartTest('normal')} className="p-4 rounded-lg border-2 transition text-center bg-gray-700/50 border-gray-600 hover:border-gray-500"><h3 className="font-bold">Modo Normal</h3><p className="text-sm opacity-80 mt-1">Realiza el test con tiempo y puntuación.</p></button><button onClick={() => handleConfirmStartTest('random')} className="p-4 rounded-lg border-2 transition text-center bg-gray-700/50 border-gray-600 hover:border-gray-500"><h3 className="font-bold">Modo Aleatorio</h3><p className="text-sm opacity-80 mt-1">Preguntas y respuestas barajadas.</p></button><button onClick={() => handleConfirmStartTest('study')} className="p-4 rounded-lg border-2 transition text-center bg-gray-700/50 border-gray-600 hover:border-gray-500"><h3 className="font-bold">Modo Estudio</h3><p className="text-sm opacity-80 mt-1">Revisa preguntas y respuestas correctas.</p></button></div></Modal>)}
            {modalState.type === 'create' && (<Modal onClose={closeModal}><h2 className="text-2xl font-bold mb-4">Crear Nuevo Test</h2><input type="text" placeholder="Título del nuevo test" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-gray-700 p-3 rounded-lg mb-4" /><button onClick={handleCreateTest} className="w-full bg-secondary py-2 rounded-lg font-bold">Crear</button></Modal>)}
            {modalState.type === 'edit' && (<Modal onClose={closeModal}><h2 className="text-2xl font-bold mb-4">Editar Título</h2><input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-gray-700 p-3 rounded-lg mb-4" /><button onClick={handleEditTest} className="w-full bg-yellow-500 text-black py-2 rounded-lg font-bold">Guardar</button></Modal>)}
            {modalState.type === 'import' && (<Modal onClose={closeModal}><h2 className="text-2xl font-bold mb-4">Importar Preguntas (JSON)</h2><textarea value={importJson} onChange={e => setImportJson(e.target.value)} className="w-full bg-gray-700 p-3 rounded-lg mb-4 h-48 font-mono" placeholder='[{"text":"...", "options":[...], "correct":0}]' /><button onClick={handleImportQuestions} className="w-full bg-blue-500 py-2 rounded-lg font-bold">Importar</button></Modal>)}
            {modalState.type === 'delete' && (<Modal onClose={closeModal}><h2 className="text-2xl font-bold mb-4 text-red-400">Confirmar Eliminación</h2><p>Estás a punto de borrar el test <strong className="font-bold">{modalState.test?.title}</strong>.</p><p className="mt-2 text-yellow-400">Esta acción no se puede deshacer. Se eliminarán también todos los intentos asociados.</p><div className="flex justify-end gap-4 mt-6"><button onClick={closeModal} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500">Cancelar</button><button onClick={handleDeleteTest} className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500 font-bold">Sí, Eliminar</button></div></Modal>)}
        </div>
    );
}