import { useState, useEffect } from 'react';
import api from '../api/auth';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/users').then(r => setUsers(r.data));
  }, []);

  const changeRole = (id, role) => {
    api.put(`/users/${id}`, { role }).then(() =>
      setUsers(us => us.map(u => u._id === id ? { ...u, role } : u))
    );
  };

  const deleteUser = id => {
    if (!confirm('¿Eliminar usuario?')) return;
    api.delete(`/users/${id}`).then(() =>
      setUsers(us => us.filter(u => u._id !== id))
    );
  };

  return (
    <div className="max-w-5xl mx-auto mt-12 bg-white bg-opacity-80 backdrop-blur-lg p-8 rounded-2xl shadow-xl">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Gestión de Usuarios</h1>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-muted/10">
            <tr>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Rol</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="hover:bg-muted/5">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 capitalize">{u.role}</td>
                <td className="p-3 space-x-2">
                  <select
                    value={u.role}
                    onChange={e => changeRole(u._id, e.target.value)}
                    className="border p-1 rounded-md"
                  >
                    <option value="alumno">Alumno</option>
                    <option value="profesor">Profesor</option>
                    <option value="administrador">Administrador</option>
                  </select>
                  <button onClick={() => deleteUser(u._id)} className="text-red-500 hover:text-red-700">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
