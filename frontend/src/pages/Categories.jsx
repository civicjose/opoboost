import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categories';
import { Folder, PlusCircle, Trash2, Edit3, X } from 'lucide-react';
import NotificationModal from '../components/NotificationModal'; // <-- 1. IMPORTAMOS EL MODAL

// --- Componente Modal Genérico (sin cambios) ---
const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
        <div className="relative bg-gray-800 text-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-white/20">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <X size={24} />
            </button>
            {children}
        </div>
    </div>
);

export default function Categories() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [modal, setModal] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [modalInfo, setModalInfo] = useState({ isOpen: false, title: '', message: '', type: 'alert' }); // <-- 2. AÑADIMOS ESTADO

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const res = await getCategories();
    setCats(res.data);
  };

  const openModal = (type, cat = null) => {
    setModal(type);
    setSelectedCategory(cat);
    if (type === 'create') {
      setForm({ name: '', description: '' });
    } else if (type === 'edit') {
      setForm({ name: cat.name, description: cat.description });
    }
  };
  const closeModal = () => {
    setModal(null);
    setSelectedCategory(null);
  };

  // --- FUNCIONES MODIFICADAS SIN ALERTS ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      if (modal === 'edit') {
        await updateCategory(selectedCategory._id, form);
      } else {
        await createCategory(form);
      }
      closeModal();
      await loadCategories();
    } catch (err) {
      // Cerramos el modal de edición/creación
      closeModal();
      // Mostramos el modal de notificación con el error
      setModalInfo({ isOpen: true, title: 'Error', message: err.response?.data?.message || 'No se pudo guardar la categoría.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    try {
      await deleteCategory(selectedCategory._id);
      closeModal();
      await loadCategories();
      setModalInfo({ isOpen: true, title: 'Éxito', message: 'La categoría ha sido eliminada correctamente.', type: 'success'});
    } catch (err) {
        closeModal();
        setModalInfo({ isOpen: true, title: 'Error', message: 'No se pudo eliminar la categoría.' });
    }
  };

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-800 to-blue-600 overflow-hidden pt-24 pb-12 px-4">
      {/* --- 3. RENDERIZAMOS EL MODAL --- */}
      <NotificationModal {...modalInfo} onClose={() => setModalInfo({ isOpen: false, title: '', message: '' })} />

      <div className="absolute top-8 left-8 w-40 h-40 bg-white opacity-10 rounded-full animate-float" />
      <div className="absolute bottom-12 right-16 w-72 h-72 bg-white opacity-5 rounded-full" />

      <div className="relative z-10 w-full max-w-6xl space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-extrabold text-white">Categorías</h1>
          {(user.role === 'profesor' || user.role === 'administrador') && (
            <button onClick={() => openModal('create')} className="flex items-center space-x-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition">
              <PlusCircle size={20} />
              <span>Añadir Categoría</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cats.map(cat => (
            <div key={cat._id} className="bg-white bg-opacity-20 backdrop-blur-lg p-6 rounded-2xl shadow-xl flex flex-col justify-between hover:bg-opacity-30 transition">
              <div className="flex items-center space-x-4">
                <Folder size={32} className="text-white" />
                <div>
                  <p className="text-lg font-semibold text-white">{cat.name}</p>
                  {cat.description && <p className="text-sm text-gray-200">{cat.description}</p>}
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <button onClick={() => navigate(`/categories/${cat._id}`)} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition">
                  Ver tests
                </button>
                {(user.role === 'profesor' || user.role === 'administrador') && (
                  <div className="flex space-x-2">
                    <button onClick={() => openModal('edit', cat)} className="text-yellow-300 hover:text-yellow-500" title="Editar"><Edit3 size={20} /></button>
                    <button onClick={() => openModal('delete', cat)} className="text-red-400 hover:text-red-600" title="Borrar"><Trash2 size={20}/></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Modales de Acción (sin cambios) --- */}
      {modal === 'create' || modal === 'edit' ? (
        <Modal onClose={closeModal}>
          <h2 className="text-2xl font-bold mb-4">{modal === 'edit' ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
              <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-gray-700 p-3 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
              <textarea rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-gray-700 p-3 rounded-lg" />
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" disabled={loading} className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition font-bold">
                {loading ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {modal === 'delete' && (
        <Modal onClose={closeModal}>
          <h2 className="text-2xl font-bold mb-4 text-red-400">Confirmar Eliminación</h2>
          <p>¿Seguro que quieres borrar la categoría <strong className="font-bold">{selectedCategory?.name}</strong>?</p>
          <p className="mt-2 text-yellow-400">Esta acción no se puede deshacer. Se eliminarán también todos los tests asociados a esta categoría.</p>
          <div className="flex justify-end gap-4 mt-6">
            <button onClick={closeModal} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500">Cancelar</button>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500 font-bold">Sí, Eliminar</button>
          </div>
        </Modal>
      )}

    </div>
  );
}