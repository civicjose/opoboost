// frontend/src/pages/AttemptsHistory.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/auth';
import { BookCopy, Check, X, Hash, Calendar, Search, ArrowUpDown } from 'lucide-react';

export default function AttemptsHistory() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'descending' });

  useEffect(() => {
    api.get('/attempts/history')
      .then(res => {
        setAttempts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching history:", err);
        setLoading(false);
      });
  }, []);

  // Lógica para filtrar y ordenar la tabla
  const sortedAndFilteredTests = useMemo(() => {
    let sortableItems = [...attempts];

    // Filtrado por término de búsqueda
    if (searchTerm) {
      sortableItems = sortableItems.filter(attempt =>
        attempt.testDef?.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenación de columnas
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        // Caso especial para ordenar por título del test (que es un objeto anidado)
        if (sortConfig.key === 'testTitle') {
            aValue = a.testDef?.title || '';
            bValue = b.testDef?.title || '';
        }

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [attempts, searchTerm, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
        // Opcional: un tercer clic podría quitar el ordenado
        key = 'createdAt';
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString('es-ES', options);
  };
  
  const getRowClass = (score) => {
    if (score >= 5) return 'bg-green-500/10';
    return 'bg-red-500/10';
  };

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-800 to-blue-600 overflow-hidden pt-24 pb-12 px-4">
      <div className="absolute top-8 left-8 w-40 h-40 bg-white opacity-10 rounded-full animate-float" />
      <div className="absolute bottom-12 right-16 w-72 h-72 bg-white opacity-5 rounded-full" />

      <div className="relative z-10 w-full max-w-6xl space-y-8">
        <h1 className="text-4xl font-extrabold text-white text-center">Historial de Intentos</h1>

        <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70" size={20}/>
            <input type="text" placeholder="Buscar por nombre del test..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full h-full bg-white/20 text-white placeholder-white/70 p-3 pl-12 rounded-xl border-2 border-transparent focus:border-white focus:outline-none transition"/>
        </div>

        <div className="overflow-x-auto bg-white/20 backdrop-blur-lg rounded-xl shadow-lg">
          <table className="w-full text-white">
            <thead className="bg-black/20">
              <tr>
                <th className="p-4 text-left cursor-pointer hover:bg-white/10" onClick={() => requestSort('testTitle')}>Test <ArrowUpDown className="inline-block ml-1" size={14}/></th>
                <th className="p-4 text-center cursor-pointer hover:bg-white/10" onClick={() => requestSort('score')}>Nota <ArrowUpDown className="inline-block ml-1" size={14}/></th>
                <th className="p-4 text-center">Desglose (A/F/V)</th>
                <th className="p-4 text-left cursor-pointer hover:bg-white/10" onClick={() => requestSort('createdAt')}>Fecha <ArrowUpDown className="inline-block ml-1" size={14}/></th>
                <th className="p-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? ( <tr><td colSpan="5" className="text-center p-8">Cargando...</td></tr> ) : 
              sortedAndFilteredTests.map(att => (
                <tr key={att._id} className={`border-b border-white/10 ${getRowClass(att.score)}`}>
                  <td className="p-4 font-medium flex items-center gap-3"><BookCopy size={18}/>{att.testDef?.title || 'Test Eliminado'}</td>
                  <td className="p-4 text-center font-bold text-xl">{att.score.toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center items-center gap-3 text-sm">
                      <span className="flex items-center gap-1 text-green-300"><Check size={14}/>{att.aciertos}</span>
                      <span className="flex items-center gap-1 text-red-300"><X size={14}/>{att.fallos}</span>
                      <span className="flex items-center gap-1 text-yellow-300"><Hash size={14}/>{att.vacias}</span>
                    </div>
                  </td>
                  <td className="p-4 flex items-center gap-2"><Calendar size={16}/>{formatDate(att.createdAt)}</td>
                  <td className="p-4 text-center">
                    <Link to={`/history/review/${att._id}`} className="bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary/80 transition text-sm">
                      Revisar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}