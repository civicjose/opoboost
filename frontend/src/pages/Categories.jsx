// src/pages/Categories.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../api/categories';
import { useNavigate } from 'react-router-dom';
import {
  Folder,
  PlusCircle,
  Trash2,
  Edit3
} from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

export default function Categories() {
  const [cats, setCats]           = useState([]);
  const [loading, setLoading]     = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({ name: '', description: '' });
  const [editId, setEditId]       = useState(null);
  const { user }                  = useContext(AuthContext);
  const navigate                  = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const res = await getCategories();
    setCats(res.data);
  };

  const openAddModal = () => {
    setForm({ name: '', description: '' });
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = cat => {
    setForm({ name: cat.name, description: cat.description });
    setEditId(cat._id);
    setShowModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      if (editId) {
        await updateCategory(editId, form);
      } else {
        await createCategory(form);
      }
      setShowModal(false);
      await loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Error guardando categoría');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('¿Borrar esta categoría?')) return;
    await deleteCategory(id);
    await loadCategories();
  };

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-800 to-blue-600 overflow-hidden">
      {/* Formas flotantes */}
      <div className="absolute top-8 left-8 w-40 h-40 bg-white opacity-10 rounded-full animate-float" />
      <div className="absolute bottom-12 right-16 w-72 h-72 bg-white opacity-5 rounded-full" />

      <div className="relative z-10 w-full max-w-6xl px-4 pt-24 pb-12 space-y-8">
        {/* Header con botón añadir */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-extrabold text-white">Categorías</h1>
          {(user.role === 'profesor' || user.role === 'administrador') && (
            <button
              onClick={openAddModal}
              className="flex items-center space-x-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition"
            >
              <PlusCircle size={20} />
              <span>Añadir</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cats.map(cat => (
            <div
              key={cat._id}
              className="bg-white bg-opacity-20 backdrop-blur-lg p-6 rounded-2xl shadow-xl flex flex-col justify-between hover:bg-opacity-30 transition"
            >
              <div className="flex items-center space-x-4">
                <Folder size={32} className="text-white" />
                <div>
                  <p className="text-lg font-semibold text-white">{cat.name}</p>
                  {cat.description && (
                    <p className="text-sm text-gray-200">{cat.description}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => navigate(`/categories/${cat._id}`)}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
                >
                  Ver tests
                </button>
                {(user.role === 'profesor' || user.role === 'administrador') && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="text-yellow-300 hover:text-yellow-500"
                      title="Editar"
                    >
                      <Edit3 size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="text-red-400 hover:text-red-600"
                      title="Borrar"
                    >
                      <Trash2 size={20}/>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal crear/editar */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4">
              {editId ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary transition"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition"
                >
                  {loading ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
