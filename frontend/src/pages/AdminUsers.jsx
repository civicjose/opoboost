// frontend/src/pages/AdminUsers.jsx
import { useState, useEffect } from 'react';
import api from '../api/auth';
import { UserCheck, UserX, Users, Clock } from 'lucide-react';

export default function AdminUsers() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [view, setView] = useState('active'); // 'active' o 'pending'
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [activeRes, pendingRes] = await Promise.all([
        api.get('/users/active'),
        api.get('/users/pending')
      ]);
      setActiveUsers(activeRes.data);
      setPendingUsers(pendingRes.data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleActivateUser = async (userId) => {
    if (!confirm('¿Activar este usuario?')) return;
    try {
      await api.put(`/auth/validate/${userId}`);
      // Mover usuario de pendiente a activo en el estado local para una UI instantánea
      const userToActivate = pendingUsers.find(u => u._id === userId);
      setPendingUsers(pendingUsers.filter(u => u._id !== userId));
      setActiveUsers([userToActivate, ...activeUsers]);
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
      <div className="relative z-10 w-full max-w-6xl space-y-8">
        <h1 className="text-4xl font-extrabold text-white">Gestión de Usuarios</h1>

        {/* Pestañas de Navegación */}
        <div className="flex justify-center border-b border-white/20">
          <button onClick={() => setView('active')} className={`px-6 py-3 font-medium text-lg transition ${view === 'active' ? 'text-white border-b-2 border-secondary' : 'text-white/60 hover:text-white'}`}>
            Usuarios Activos ({activeUsers.length})
          </button>
          <button onClick={() => setView('pending')} className={`px-6 py-3 font-medium text-lg transition relative ${view === 'pending' ? 'text-white border-b-2 border-secondary' : 'text-white/60 hover:text-white'}`}>
            Pendientes ({pendingUsers.length})
            {pendingUsers.length > 0 && <span className="absolute top-2 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>}
          </button>
        </div>

        {/* Contenido de la Tabla */}
        <div className="overflow-x-auto bg-white/20 backdrop-blur-lg rounded-xl shadow-lg">
          {loading ? <p className="text-center text-white p-8">Cargando...</p> : (
            view === 'active' ? (
              <ActiveUsersTable users={activeUsers} onChangeRole={handleChangeRole} onDelete={handleDeleteUser} />
            ) : (
              <PendingUsersTable users={pendingUsers} onActivate={handleActivateUser} />
            )
          )}
        </div>
      </div>
    </div>
  );
}

// --- Sub-componentes para las tablas ---

const ActiveUsersTable = ({ users, onChangeRole, onDelete }) => (
  <table className="w-full text-white">
    <thead className="bg-black/20"><tr><th className="p-4 text-left">Nombre</th><th className="p-4 text-left">Email</th><th className="p-4 text-left">Rol</th><th className="p-4 text-left">Acciones</th></tr></thead>
    <tbody>
      {users.map(u => (
        <tr key={u._id} className="border-b border-white/10">
          <td className="p-4">{u.name}</td>
          <td className="p-4">{u.email}</td>
          <td className="p-4">
            <select value={u.role} onChange={e => onChangeRole(u._id, e.target.value)} className="bg-white/10 border border-white/30 rounded-md p-1">
              <option value="alumno">Alumno</option>
              <option value="profesor">Profesor</option>
              <option value="administrador">Administrador</option>
            </select>
          </td>
          <td className="p-4">
            <button onClick={() => onDelete(u._id)} className="text-red-400 hover:text-red-300 transition"><UserX size={20}/></button>
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
          <td className="p-4">
            <button onClick={() => onActivate(u._id)} className="flex items-center gap-2 bg-green-500 text-white px-3 py-1.5 rounded-md hover:bg-green-400 transition">
              <UserCheck size={16}/> Activar
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);