// frontend/src/pages/TestList.jsx
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { getCategoryById } from '../api/categories';
import { createTestDefinition, updateTestDefinition, importQuestionsToTest, deleteTest } from '../api/tests';
import api from '../api/auth';
import { PlusCircle, Edit, FileJson, Search, ChevronRight, X, Trash2, ArrowUpDown } from 'lucide-react';

// --- Componente Modal Genérico (reutilizable) ---
const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
    <div className="relative bg-gray-800 text-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-white/20">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
      {children}
    </div>
  </div>
);

export default function TestList() {
  const { cat } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // --- State del Componente ---
  const [category, setCategory] = useState(null);
  const [tests, setTests] = useState([]);
  const [progress, setProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'ascending' });

  // --- State para los Modales ---
  const [modal, setModal] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [importJson, setImportJson] = useState('');

  // --- Lógica de Datos ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const catRes = await getCategoryById(cat);
      setCategory(catRes.data);
      const testsRes = await api.get(`/tests/category-stats/${cat}`);
      setTests(testsRes.data.tests);
      setProgress(testsRes.data.progress);
    } catch (error) {
      console.error("Error al cargar la lista de tests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [cat]);

  // Lógica de filtrado y ordenación
  const sortedAndFilteredTests = useMemo(() => {
    let sortableTests = [...tests];
    if (sortConfig.key !== null) {
      sortableTests.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableTests.filter(test => test.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [tests, searchTerm, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  // --- Handlers para Acciones ---
  const openModal = (type, test = null) => {
    setModal(type);
    setSelectedTest(test);
    if (type === 'edit') setNewTitle(test?.title || '');
    if (type === 'create') setNewTitle('');
    if (type === 'import') setImportJson('');
  };
  const closeModal = () => {
    setModal(null);
    setSelectedTest(null);
  };

  const handleCreateTest = async () => {
    if (!newTitle.trim()) return alert('El título es obligatorio.');
    await createTestDefinition(cat, newTitle);
    closeModal();
    fetchData();
  };

  const handleEditTest = async () => {
    if (!newTitle.trim() || !selectedTest) return;
    await updateTestDefinition(selectedTest._id, { title: newTitle });
    closeModal();
    fetchData();
  };

  const handleImportQuestions = async () => {
    if (!importJson.trim() || !selectedTest) return;
    try {
      const questionsArray = JSON.parse(importJson);
      await importQuestionsToTest(selectedTest._id, questionsArray);
      alert('Preguntas importadas con éxito');
      closeModal();
      fetchData();
    } catch (e) {
      alert('JSON inválido. Por favor, revisa el formato.');
    }
  };
  
  const handleDeleteTest = async () => {
    if (!selectedTest) return;
    try {
      await deleteTest(selectedTest._id);
      alert('Test eliminado con éxito.');
      closeModal();
      fetchData();
    } catch (error) {
      alert('Error al eliminar el test.');
    }
  };

  const getRowClass = (score) => {
    if (score === 0) return 'bg-white/10';
    if (score >= 5) return 'bg-green-500/20 hover:bg-green-500/30';
    return 'bg-red-500/20 hover:bg-red-500/30';
  };

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-800 to-blue-600 overflow-hidden pt-24 pb-12 px-4">
      <div className="absolute top-8 left-8 w-40 h-40 bg-white opacity-10 rounded-full animate-float" />
      <div className="absolute bottom-12 right-16 w-72 h-72 bg-white opacity-5 rounded-full" />

      <div className="relative z-10 w-full max-w-6xl space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-4xl font-extrabold text-white">Tests de {category?.name || '...'}</h1>
          {(user.role === 'profesor' || user.role === 'administrador') && (
            <button onClick={() => openModal('create')} className="flex items-center space-x-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition">
              <PlusCircle size={20} /><span>Crear Test</span>
            </button>
          )}
        </div>

        {/* --- LAYOUT CORREGIDO: UN DIV DEBAJO DE OTRO --- */}
        <div className="space-y-6">
            <div className="bg-white/20 backdrop-blur-lg p-4 rounded-xl">
                <h3 className="text-white font-semibold mb-2">Progreso en la Categoría</h3>
                <div className="w-full bg-black/20 rounded-full h-4"><div className="h-4 bg-green-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div></div>
                <p className="text-right text-white text-sm mt-1">{progress}% Aprobado</p>
            </div>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70" size={20}/>
                <input type="text" placeholder="Buscar test..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full h-full bg-white/20 text-white placeholder-white/70 p-3 pl-12 rounded-xl border-2 border-transparent focus:border-white focus:outline-none transition"/>
            </div>
        </div>

        <div className="overflow-x-auto bg-white/20 backdrop-blur-lg rounded-xl shadow-lg">
          <table className="w-full text-white">
            <thead className="bg-black/20">
              <tr>
                <th className="p-4 text-left cursor-pointer hover:bg-white/10" onClick={() => requestSort('title')}>Título <ArrowUpDown className="inline-block ml-1" size={14}/></th>
                <th className="p-4 text-center cursor-pointer hover:bg-white/10" onClick={() => requestSort('userAttemptsCount')}>Intentos <ArrowUpDown className="inline-block ml-1" size={14}/></th>
                <th className="p-4 text-center cursor-pointer hover:bg-white/10" onClick={() => requestSort('highestScore')}>Nota Máx. <ArrowUpDown className="inline-block ml-1" size={14}/></th>
                <th className="p-4 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? ( <tr><td colSpan="4" className="text-center p-8">Cargando...</td></tr> ) : 
              sortedAndFilteredTests.map(test => (
                <tr key={test._id} className={`border-b border-white/10 transition-colors ${getRowClass(test.highestScore)}`}>
                  <td className="p-4 font-medium">{test.title}</td>
                  <td className="p-4 text-center">{test.userAttemptsCount}</td>
                  <td className="p-4 text-center font-bold">{test.highestScore.toFixed(2)}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2 items-center">
                      <button onClick={() => navigate(`/categories/${cat}/${test._id}`)} className="flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary/80 transition">Realizar Test <ChevronRight size={16}/></button>
                      {(user.role === 'profesor' || user.role === 'administrador') && (<>
                        <button onClick={() => openModal('import', test)} className="p-2 rounded-md bg-blue-500 hover:bg-blue-400 transition" title="Importar JSON"><FileJson size={16}/></button>
                        <button onClick={() => openModal('edit', test)} className="p-2 rounded-md bg-yellow-500 text-black hover:bg-yellow-400 transition" title="Editar Título"><Edit size={16}/></button>
                      </>)}
                      {user.role === 'administrador' && (
                        <button onClick={() => openModal('delete', test)} className="p-2 rounded-md bg-red-600 hover:bg-red-500 transition" title="Borrar Test"><Trash2 size={16}/></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {modal === 'create' && (
        <Modal onClose={closeModal}>
          <h2 className="text-2xl font-bold mb-4">Crear Nuevo Test</h2>
          <input type="text" placeholder="Título del nuevo test" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-gray-700 p-3 rounded-lg mb-4" />
          <button onClick={handleCreateTest} className="w-full bg-secondary py-2 rounded-lg font-bold">Crear</button>
        </Modal>
      )}
      {modal === 'edit' && (
        <Modal onClose={closeModal}>
          <h2 className="text-2xl font-bold mb-4">Editar Título</h2>
          <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-gray-700 p-3 rounded-lg mb-4" />
          <button onClick={handleEditTest} className="w-full bg-yellow-500 text-black py-2 rounded-lg font-bold">Guardar Cambios</button>
        </Modal>
      )}
      {modal === 'import' && (
        <Modal onClose={closeModal}>
          <h2 className="text-2xl font-bold mb-4">Importar Preguntas (JSON)</h2>
          <textarea value={importJson} onChange={e => setImportJson(e.target.value)} className="w-full bg-gray-700 p-3 rounded-lg mb-4 h-48 font-mono" placeholder='[{"text":"Pregunta 1", "options":[...], "correct":0}]' />
          <button onClick={handleImportQuestions} className="w-full bg-blue-500 py-2 rounded-lg font-bold">Importar</button>
        </Modal>
      )}
      {modal === 'delete' && (
        <Modal onClose={closeModal}>
          <h2 className="text-2xl font-bold mb-4 text-red-400">Confirmar Eliminación</h2>
          <p>Estás a punto de borrar el test <strong className="font-bold">{selectedTest?.title}</strong>.</p>
          <p className="mt-2 text-yellow-400">Esta acción no se puede deshacer. Se eliminarán también todos los intentos de examen asociados a este test.</p>
          <div className="flex justify-end gap-4 mt-6">
            <button onClick={closeModal} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500">Cancelar</button>
            <button onClick={handleDeleteTest} className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500 font-bold">Sí, Eliminar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}