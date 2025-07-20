import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/auth';
import { getCategories } from '../api/categories';
import { UserCheck, UserX, Clock, Key, X, Check, Search, ArrowUpDown } from 'lucide-react';

const Modal = ({ children, onClose }) => ( <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70"> <div className="relative bg-gray-800 text-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-white/20"> <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button> {children} </div> </div> );

export default function AdminUsers() {
    const [activeUsers, setActiveUsers] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [view, setView] = useState('active');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
    const [isPermissionsModalOpen, setPermissionsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userPermissions, setUserPermissions] = useState([]);
    const [saveStatus, setSaveStatus] = useState('idle');
    const fetchData = async () => { try { setLoading(true); const [activeRes, pendingRes, categoriesRes] = await Promise.all([api.get('/users/active'), api.get('/users/pending'), getCategories()]); setActiveUsers(activeRes.data); setPendingUsers(pendingRes.data); setAllCategories(categoriesRes.data); } catch (error) { console.error("Error cargando datos de administración:", error); } finally { setLoading(false); } };
    useEffect(() => { fetchData(); }, []);
    const openPermissionsModal = async (user) => { setSelectedUser(user); setSaveStatus('idle'); try { const res = await api.get(`/users/${user._id}/permissions`); setUserPermissions(res.data); setPermissionsModalOpen(true); } catch (error) { alert("Error al cargar los permisos del usuario."); } };
    const closeModal = () => setPermissionsModalOpen(false);
    const handlePermissionChange = (categoryId) => { setUserPermissions(prev => prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]); };
    const handleSavePermissions = async () => { setSaveStatus('saving'); try { await api.put(`/users/${selectedUser._id}/permissions`, { categoryIds: userPermissions }); setSaveStatus('success'); setTimeout(() => { setSaveStatus('idle'); }, 2000); } catch (error) { alert("Error al guardar los permisos."); setSaveStatus('idle'); } };
    const handleActivateUser = async (userId) => { if (!confirm('¿Activar este usuario?')) return; try { await api.put(`/auth/validate/${userId}`); fetchData(); } catch (error) { alert('Error al activar el usuario.'); } };
    const handleChangeRole = async (userId, newRole) => { try { await api.put(`/users/${userId}`, { role: newRole }); setActiveUsers(users => users.map(u => u._id === userId ? { ...u, role: newRole } : u)); } catch (error) { alert('Error al cambiar el rol.'); } };
    const handleDeleteUser = async (userId) => { if (!confirm('¿Eliminar este usuario permanentemente?')) return; try { await api.delete(`/users/${userId}`); setActiveUsers(users => users.filter(u => u._id !== userId)); } catch (error) { alert('Error al eliminar el usuario.'); } };
    const processUsers = (users) => {
        let filteredUsers = [...users];
        if (searchTerm) {
            filteredUsers = filteredUsers.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (sortConfig.key !== null) {
            filteredUsers.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return filteredUsers;
    };
    const sortedAndFilteredActiveUsers = useMemo(() => processUsers(activeUsers), [activeUsers, searchTerm, sortConfig]);
    const sortedAndFilteredPendingUsers = useMemo(() => processUsers(pendingUsers), [pendingUsers, searchTerm, sortConfig]);
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="relative flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-800 to-blue-600 overflow-hidden pt-24 pb-12 px-4">
            <div className="absolute top-8 left-8 w-40 h-40 bg-white opacity-10 rounded-full animate-float" />
            <div className="absolute bottom-12 right-16 w-72 h-72 bg-white opacity-5 rounded-full" />
            <div className="relative z-10 w-full max-w-6xl space-y-8">
                <h1 className="text-4xl font-extrabold text-white">Gestión de Usuarios</h1>
                <div className="flex justify-center border-b border-white/20">
                    <button onClick={() => setView('active')} className={`px-6 py-3 font-medium text-lg transition ${view === 'active' ? 'text-white border-b-2 border-secondary' : 'text-white/60 hover:text-white'}`}>Activos ({activeUsers.length})</button>
                    <button onClick={() => setView('pending')} className={`px-6 py-3 font-medium text-lg transition relative ${view === 'pending' ? 'text-white border-b-2 border-secondary' : 'text-white/60 hover:text-white'}`}>Pendientes ({pendingUsers.length}){pendingUsers.length > 0 && <span className="absolute top-2 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>}</button>
                </div>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70" size={20}/>
                    <input type="text" placeholder="Buscar por nombre o email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full h-full bg-white/20 text-white placeholder-white/70 p-3 pl-12 rounded-xl border-2 border-transparent focus:border-white focus:outline-none transition"/>
                </div>
                <div className="bg-white/20 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden">
                    {loading ? <p className="text-center text-white p-8">Cargando...</p> : 
                        view === 'active' ? <ActiveUsersTable users={sortedAndFilteredActiveUsers} onChangeRole={handleChangeRole} onDelete={handleDeleteUser} onManagePermissions={openPermissionsModal} onSort={requestSort} /> : 
                        <PendingUsersTable users={sortedAndFilteredPendingUsers} onActivate={handleActivateUser} onSort={requestSort} />
                    }
                </div>
            </div>
            {isPermissionsModalOpen && selectedUser && ( <Modal onClose={closeModal}> <h2 className="text-2xl font-bold mb-4">Gestionar Permisos de {selectedUser.name}</h2> <div className="space-y-2 max-h-80 overflow-y-auto bg-black/20 p-4 rounded-lg"> {allCategories.length > 0 ? allCategories.map(category => ( <div key={category._id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"> <span className="font-medium">{category.name}</span> <button onClick={() => handlePermissionChange(category._id)} className={`p-2 rounded-full transition ${userPermissions.includes(category._id) ? 'bg-green-500' : 'bg-gray-600 hover:bg-gray-500'}`}> <Check size={20}/> </button> </div> )) : <p>No hay categorías creadas para asignar permisos.</p>} </div> <div className="flex justify-end pt-6"> <button onClick={handleSavePermissions} disabled={saveStatus !== 'idle'} className={`px-6 py-2 rounded-lg font-bold transition w-40 h-11 flex items-center justify-center ${ saveStatus === 'idle' ? 'bg-secondary hover:bg-secondary/90' : saveStatus === 'saving' ? 'bg-gray-500' : 'bg-green-500' }`}> {saveStatus === 'idle' && 'Guardar Permisos'} {saveStatus === 'saving' && 'Guardando...'} {saveStatus === 'success' && '¡Guardado!'} </button> </div> </Modal> )}
        </div>
    );
}

const SortableHeader = ({ label, sortKey, onSort, className }) => ( <div className={`p-4 font-semibold cursor-pointer hover:bg-white/10 flex items-center ${className}`} onClick={() => onSort(sortKey)}> {label} <ArrowUpDown className="inline-block ml-1" size={14} /> </div> );

const ActiveUsersTable = ({ users, onChangeRole, onDelete, onManagePermissions, onSort }) => (
    <div className="text-white">
        <div className="hidden md:grid md:grid-cols-12 items-center bg-black/20">
            <div className="col-span-4 rounded-tl-xl"><SortableHeader label="Nombre" sortKey="name" onSort={onSort} className="hover:bg-white/10 w-full" /></div>
            <div className="col-span-4"><SortableHeader label="Email" sortKey="email" onSort={onSort} className="hover:bg-white/10 w-full" /></div>
            <div className="col-span-2 flex justify-center"><SortableHeader label="Rol" sortKey="role" onSort={onSort} className="hover:bg-white/10 w-full justify-center" /></div>
            <div className="col-span-2 p-4 font-semibold text-right rounded-tr-xl">Acciones</div>
        </div>
        <div className="flex flex-col md:gap-0">
            {users.map((u, index) => (
                <div key={u._id} className={`md:grid md:grid-cols-12 md:items-center p-4 md:p-0 md:border-b md:border-white/10 ${index === users.length - 1 ? 'md:border-b-0' : ''}`}>
                    <div className="md:p-4 md:col-span-4"><span className="font-semibold md:hidden">Nombre: </span>{u.name}</div>
                    <div className="md:p-4 md:col-span-4 truncate"><span className="font-semibold md:hidden">Email: </span>{u.email}</div>
                    <div className="mt-2 md:mt-0 md:col-span-2 flex justify-between md:justify-center items-center"><span className="font-semibold md:hidden">Rol: </span><select value={u.role} onChange={e => onChangeRole(u._id, e.target.value)} className="bg-white/20 text-white p-1 rounded-lg border-2 border-transparent focus:border-white focus:outline-none transition"><option value="alumno" className="text-black">Alumno</option><option value="profesor" className="text-black">Profesor</option><option value="administrador" className="text-black">Administrador</option></select></div>
                    <div className="mt-4 md:mt-0 md:col-span-2 flex justify-end items-center gap-2 md:p-4"><button onClick={() => onManagePermissions(u)} className="p-2 rounded-md bg-blue-500 hover:bg-blue-400 transition" title="Gestionar Permisos"><Key size={16}/></button><button onClick={() => onDelete(u._id)} className="p-2 rounded-md bg-red-600 hover:bg-red-500 transition" title="Eliminar Usuario"><UserX size={16}/></button></div>
                </div>
            ))}
        </div>
    </div>
);

const PendingUsersTable = ({ users, onActivate, onSort }) => (
  <div className="text-white">
      <div className="hidden md:grid md:grid-cols-12 items-center bg-black/20">
          <div className="col-span-5 rounded-tl-xl"><SortableHeader label="Nombre" sortKey="name" onSort={onSort} className="hover:bg-white/10 w-full" /></div>
          <div className="col-span-4"><SortableHeader label="Email" sortKey="email" onSort={onSort} className="hover:bg-white/10 w-full" /></div>
          <div className="col-span-3 p-4 font-semibold text-right rounded-tr-xl">Acción</div>
      </div>
      <div className="flex flex-col md:gap-0">
          {users.map((u, index) => (
              <div key={u._id} className={`md:grid md:grid-cols-12 md:items-center p-4 md:p-0 md:border-b md:border-white/10 ${index === users.length - 1 ? 'md:border-b-0' : ''}`}>
                  <div className="md:p-4 md:col-span-5"><span className="font-semibold md:hidden">Nombre: </span>{u.name}</div>
                  <div className="md:p-4 md:col-span-4 truncate"><span className="font-semibold md:hidden">Email: </span>{u.email}</div>
                  <div className="mt-4 md:mt-0 md:col-span-3 flex justify-end items-center md:p-4"><button onClick={() => onActivate(u._id)} className="flex items-center justify-center gap-2 bg-green-500 text-white px-3 py-1.5 rounded-md hover:bg-green-400 transition w-full md:w-auto"><UserCheck size={16}/> Activar</button></div>
              </div>
          ))}
      </div>
  </div>
);