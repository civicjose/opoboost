// frontend/src/pages/AdminUsers.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/auth';
import { getCategories } from '../api/categories';
import { UserCheck, UserX, Users, Clock, Key, X, Check } from 'lucide-react';

// --- Componente Modal Genérico ---
const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
        <div className="relative bg-gray-800 text-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-white/20">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
            {children}
        </div>
    </div>
);

export default function AdminUsers() {
    const [activeUsers, setActiveUsers] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [view, setView] = useState('active');
    const [loading, setLoading] = useState(true);

    // --- State para el Modal de Permisos ---
    const [isPermissionsModalOpen, setPermissionsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userPermissions, setUserPermissions] = useState([]);
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'success'

    const fetchData = async () => {
        try {
            setLoading(true);
            const [activeRes, pendingRes, categoriesRes] = await Promise.all([
                api.get('/users/active'),
                api.get('/users/pending'),
                getCategories()
            ]);
            setActiveUsers(activeRes.data);
            setPendingUsers(pendingRes.data);
            setAllCategories(categoriesRes.data);
        } catch (error) {
            console.error("Error cargando datos de administración:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openPermissionsModal = async (user) => {
        setSelectedUser(user);
        setSaveStatus('idle');
        try {
            const res = await api.get(`/users/${user._id}/permissions`);
            setUserPermissions(res.data);
            setPermissionsModalOpen(true);
        } catch (error) {
            alert("Error al cargar los permisos del usuario.");
        }
    };
    
    const closeModal = () => setPermissionsModalOpen(false);

    const handlePermissionChange = (categoryId) => {
        setUserPermissions(prev => 
            prev.includes(categoryId) 
                ? prev.filter(id => id !== categoryId) 
                : [...prev, categoryId]
        );
    };

    const handleSavePermissions = async () => {
        setSaveStatus('saving');
        try {
            await api.put(`/users/${selectedUser._id}/permissions`, { categoryIds: userPermissions });
            setSaveStatus('success');
            setTimeout(() => {
                setSaveStatus('idle');
            }, 2000);
        } catch (error) {
            alert("Error al guardar los permisos.");
            setSaveStatus('idle');
        }
    };

    const handleActivateUser = async (userId) => {
        if (!confirm('¿Activar este usuario?')) return;
        try {
            await api.put(`/auth/validate/${userId}`);
            const userToActivate = pendingUsers.find(u => u._id === userId);
            setPendingUsers(pendingUsers.filter(u => u._id !== userId));
            setActiveUsers(prev => [userToActivate, ...prev]);
        } catch (error) {
            alert('Error al activar el usuario.');
        }
    };

    const handleChangeRole = async (userId, newRole) => {
        try {
            await api.put(`/users/${userId}`, { role: newRole });
            setActiveUsers(users => users.map(u => u._id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            alert('Error al cambiar el rol.');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('¿Eliminar este usuario permanentemente?')) return;
        try {
            await api.delete(`/users/${userId}`);
            setActiveUsers(users => users.filter(u => u._id !== userId));
        } catch (error) {
            alert('Error al eliminar el usuario.');
        }
    };

    return (
        <div className="relative flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-800 to-blue-600 overflow-hidden pt-24 pb-12 px-4">
            <div className="absolute top-8 left-8 w-40 h-40 bg-white opacity-10 rounded-full animate-float" />
            <div className="absolute bottom-12 right-16 w-72 h-72 bg-white opacity-5 rounded-full" />

            <div className="relative z-10 w-full max-w-6xl space-y-8">
                <h1 className="text-4xl font-extrabold text-white">Gestión de Usuarios</h1>

                <div className="flex justify-center border-b border-white/20">
                    <button onClick={() => setView('active')} className={`px-6 py-3 font-medium text-lg transition ${view === 'active' ? 'text-white border-b-2 border-secondary' : 'text-white/60 hover:text-white'}`}>Usuarios Activos ({activeUsers.length})</button>
                    <button onClick={() => setView('pending')} className={`px-6 py-3 font-medium text-lg transition relative ${view === 'pending' ? 'text-white border-b-2 border-secondary' : 'text-white/60 hover:text-white'}`}>Pendientes ({pendingUsers.length}){pendingUsers.length > 0 && <span className="absolute top-2 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>}</button>
                </div>

                <div className="overflow-x-auto bg-white/20 backdrop-blur-lg rounded-xl shadow-lg">
                    {loading ? <p className="text-center text-white p-8">Cargando...</p> : 
                        view === 'active' ? <ActiveUsersTable users={activeUsers} onChangeRole={handleChangeRole} onDelete={handleDeleteUser} onManagePermissions={openPermissionsModal} /> : <PendingUsersTable users={pendingUsers} onActivate={handleActivateUser} />
                    }
                </div>
            </div>

            {isPermissionsModalOpen && selectedUser && (
                <Modal onClose={closeModal}>
                    <h2 className="text-2xl font-bold mb-4">Gestionar Permisos de {selectedUser.name}</h2>
                    <div className="space-y-2 max-h-80 overflow-y-auto bg-black/20 p-4 rounded-lg">
                        {allCategories.length > 0 ? allCategories.map(category => (
                            <div key={category._id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                <span className="font-medium">{category.name}</span>
                                <button onClick={() => handlePermissionChange(category._id)} className={`p-2 rounded-full transition ${userPermissions.includes(category._id) ? 'bg-green-500' : 'bg-gray-600 hover:bg-gray-500'}`}>
                                    <Check size={20}/>
                                </button>
                            </div>
                        )) : <p>No hay categorías creadas para asignar permisos.</p>}
                    </div>
                    <div className="flex justify-end pt-6">
                        <button onClick={handleSavePermissions} disabled={saveStatus !== 'idle'} className={`px-6 py-2 rounded-lg font-bold transition w-40 h-11 flex items-center justify-center ${
                            saveStatus === 'idle' ? 'bg-secondary hover:bg-secondary/90' :
                            saveStatus === 'saving' ? 'bg-gray-500' : 'bg-green-500'
                        }`}>
                           {saveStatus === 'idle' && 'Guardar Permisos'}
                           {saveStatus === 'saving' && 'Guardando...'}
                           {saveStatus === 'success' && '¡Guardado!'}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

const ActiveUsersTable = ({ users, onChangeRole, onDelete, onManagePermissions }) => (
    <table className="w-full text-white">
        <thead className="bg-black/20"><tr><th className="p-4 text-left">Nombre</th><th className="p-4 text-left">Email</th><th className="p-4 text-left">Rol</th><th className="p-4 text-left">Acciones</th></tr></thead>
        <tbody>
            {users.map(u => (
                <tr key={u._id} className="border-b border-white/10">
                    <td className="p-4">{u.name}</td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">
                        <select 
                            value={u.role} 
                            onChange={e => onChangeRole(u._id, e.target.value)} 
                            className="bg-white/20 text-white p-1 rounded-lg border-2 border-transparent focus:border-white focus:outline-none transition"
                        >
                            <option value="alumno" className="text-black">Alumno</option>
                            <option value="profesor" className="text-black">Profesor</option>
                            <option value="administrador" className="text-black">Administrador</option>
                        </select>
                    </td>
                    <td className="p-4">
                        <div className="flex gap-2">
                            <button onClick={() => onManagePermissions(u)} className="p-2 rounded-md bg-blue-500 hover:bg-blue-400 transition" title="Gestionar Permisos"><Key size={16}/></button>
                            <button onClick={() => onDelete(u._id)} className="p-2 rounded-md bg-red-600 hover:bg-red-500 transition" title="Eliminar Usuario"><UserX size={16}/></button>
                        </div>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
);

const PendingUsersTable = ({ users, onActivate }) => (
  <table className="w-full text-white">
    <thead className="bg-black/20"><tr><th className="p-4 text-left">Nombre</th><th className="p-4 text-left">Email</th><th className="p-4 text-left">Fecha Registro</th><th className="p-4 text-left">Acción</th></tr></thead>
    <tbody>
      {users.map(u => (
        <tr key={u._id} className="border-b border-white/10">
          <td className="p-4">{u.name}</td>
          <td className="p-4">{u.email}</td>
          <td className="p-4 flex items-center gap-2"><Clock size={16}/> {new Date(u.createdAt).toLocaleDateString()}</td>
          <td className="p-4"><button onClick={() => onActivate(u._id)} className="flex items-center gap-2 bg-green-500 text-white px-3 py-1.5 rounded-md hover:bg-green-400 transition"><UserCheck size={16}/> Activar</button></td>
        </tr>
      ))}
    </tbody>
  </table>
);