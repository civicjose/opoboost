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

  const sortedAndFilteredTests = useMemo(() => {
    let sortableItems = [...attempts];
    if (searchTerm) {
      sortableItems = sortableItems.filter(attempt =>
        attempt.testDef?.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a.testDef?.title || '';
        if (sortConfig.key !== 'testTitle') aValue = a[sortConfig.key];
        let bValue = b.testDef?.title || '';
        if (sortConfig.key !== 'testTitle') bValue = b[sortConfig.key];
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
    }
    setSortConfig({ key, direction });
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString('es-ES', options);
  };
  
  const getRowClass = (score) => {
    const baseClasses = 'border-l-4 md:border-l-0';
    if (score >= 5) return `bg-green-500/10 ${baseClasses} border-green-500/50`;
    return `bg-red-500/10 ${baseClasses} border-red-500/50`;
  };

  const SortableHeader = ({ label, sortKey, className = '' }) => (
    <div
      className={`p-4 font-semibold cursor-pointer flex items-center ${className}`}
      onClick={() => requestSort(sortKey)}
    >
      {label}
      <ArrowUpDown className="inline-block ml-1" size={14}/>
    </div>
  );

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

        <div className="bg-white/20 backdrop-blur-lg rounded-xl shadow-lg text-white overflow-hidden">
          <div className="hidden md:grid md:grid-cols-12 items-center bg-black/20">
            <div className="col-span-5"><SortableHeader label="Test" sortKey="testTitle" className="hover:bg-white/10 rounded-tl-xl" /></div>
            <div className="col-span-2 flex justify-center"><SortableHeader label="Nota" sortKey="score" className="hover:bg-white/10 w-full justify-center" /></div>
            <div className="col-span-2 flex justify-center"><SortableHeader label="Desglose" sortKey="aciertos" className="hover:bg-white/10 w-full justify-center" /></div>
            <div className="col-span-3 flex justify-center"><SortableHeader label="Fecha" sortKey="createdAt" className="hover:bg-white/10 w-full justify-center rounded-tr-xl" /></div>
          </div>

          <div className="flex flex-col md:gap-0">
            {loading ? ( <p className="text-center p-8">Cargando...</p> ) : 
            sortedAndFilteredTests.map((att, index) => (
              <Link key={att._id} to={`/history/review/${att._id}`} className={`md:grid md:grid-cols-12 md:items-center p-4 md:p-0 block hover:bg-white/10 transition-colors border-b border-white/10 ${index === sortedAndFilteredTests.length - 1 ? 'md:border-b-0' : ''} ${getRowClass(att.score)}`}>
                <div className="md:col-span-5 md:p-4 font-medium flex items-center gap-3">
                    <BookCopy size={18}/>
                    <span className="truncate">{att.testDef?.title || 'Test Eliminado'}</span>
                </div>
                <div className="mt-2 md:mt-0 md:col-span-2 flex justify-between md:justify-center items-center">
                  <span className="font-semibold text-gray-300 md:hidden">Nota:</span>
                  <span className="font-bold text-xl">{att.score.toFixed(2)}</span>
                </div>
                <div className="mt-2 md:mt-0 md:col-span-2 flex justify-between md:justify-center items-center">
                   <span className="font-semibold text-gray-300 md:hidden">Desglose (A/F/V):</span>
                    <div className="flex justify-center items-center gap-3 text-sm">
                      <span className="flex items-center gap-1 text-green-300"><Check size={14}/>{att.aciertos}</span>
                      <span className="flex items-center gap-1 text-red-300"><X size={14}/>{att.fallos}</span>
                      <span className="flex items-center gap-1 text-yellow-300"><Hash size={14}/>{att.vacias}</span>
                    </div>
                </div>
                <div className="mt-2 md:mt-0 md:col-span-3 flex justify-between md:justify-center items-center">
                  <span className="font-semibold text-gray-300 md:hidden">Fecha:</span>
                  <div className="flex items-center gap-2">
                    <Calendar size={16}/>
                    {formatDate(att.createdAt)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}