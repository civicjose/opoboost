import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import {
  getTestDefsByCategory,
  createTestDefinition,
  importQuestionsToTest
} from '../api/tests';
import { getCategoryById } from '../api/categories';
import { PlusCircle, Folder, Upload } from 'lucide-react';

export default function TestList() {
  const { cat } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [catName, setCatName] = useState('');
  const [tests, setTests] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [currentDefId, setCurrentDefId] = useState('');

  useEffect(() => {
    getCategoryById(cat).then(r => setCatName(r.data.name));
    loadTests();
  }, [cat]);

  const loadTests = async () => {
    const r = await getTestDefsByCategory(cat);
    setTests(r.data);
  };

  const handleCreate = async e => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await createTestDefinition(cat, newTitle.trim());
    setShowCreate(false);
    setNewTitle('');
    loadTests();
  };

  const handleImport = async () => {
    try {
      const arr = JSON.parse(importJson);
      await importQuestionsToTest(currentDefId, arr);
      setShowImport(false);
      setImportJson('');
      loadTests();
    } catch {
      alert('JSON inválido');
    }
  };

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-800 to-blue-600 overflow-hidden">
      {/* Decorativos */}
      <div className="absolute top-8 left-8 w-40 h-40 bg-white opacity-10 rounded-full animate-float" />
      <div className="absolute bottom-12 right-16 w-72 h-72 bg-white opacity-5 rounded-full" />

      <div className="relative z-10 w-full max-w-6xl px-4 pt-24 pb-12 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-extrabold text-white">Tests de {catName}</h1>
          {(user.role === 'profesor' || user.role === 'administrador') && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center space-x-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition"
            >
              <PlusCircle size={20} />
              <span>Crear Test</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map(td => (
            <div
              key={td._id}
              className="bg-white bg-opacity-20 backdrop-blur-lg p-6 rounded-2xl shadow-xl flex flex-col justify-between hover:bg-opacity-30 transition"
            >
              <div className="flex items-center space-x-4">
                <Folder size={32} className="text-white" />
                <div>
                  <p className="text-lg font-semibold text-white">{td.title}</p>
                  <p className="text-sm text-gray-200">{td.questions?.length || 0} preguntas</p>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => navigate(`/categories/${cat}/${td._id}`)}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
                >
                  Empezar Test
                </button>
                {(user.role === 'profesor' || user.role === 'administrador') && (
                  <button
                    onClick={() => {
                      setCurrentDefId(td._1);
                      setShowImport(true);
                    }}
                    className="text-white bg-white bg-opacity-30 p-2 rounded-full hover:bg-opacity-50 transition"
                    title="Importar preguntas"
                  >
                    <Upload size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Crear Test */}
      {showCreate && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setShowCreate(false)}
          />
          <form
            onSubmit={handleCreate}
            className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
          >
            <h2 className="text-xl font-semibold mb-4">Nuevo Test</h2>
            <input
              type="text"
              required
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Título del test"
              className="w-full border border-gray-300 p-2 rounded-lg mb-4 focus:ring-2 focus:ring-secondary"
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90"
              >
                Crear
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Importar Preguntas */}
      {showImport && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setShowImport(false)}
          />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Importar Preguntas (JSON)</h2>
            <textarea
              rows="8"
              required
              value={importJson}
              onChange={e => setImportJson(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-lg mb-4 focus:ring-2 focus:ring-secondary"
              placeholder='[{"text":"…","options":["…"],"correct":0,…}, …]'
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowImport(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90"
              >
                Importar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
