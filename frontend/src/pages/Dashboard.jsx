// src/pages/Dashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { getStats }    from '../api/stats';
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  BookOpen
} from 'lucide-react';

const statsConfig = [
  { key: 'totalTests', label: 'Tests realizados', icon: <ClipboardList size={28}/> },
  { key: 'correct',    label: 'Aciertos',        icon: <CheckCircle size={28}/> },
  { key: 'incorrect',  label: 'Fallos',          icon: <XCircle size={28}/> },
  { key: 'simulacros', label: 'Simulacros',      icon: <BookOpen size={28}/> }
];

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats().then(res => setStats(res.data));
  }, []);

  if (!stats) {
    return (
      <div className="pt-24 flex justify-center">
        <p className="text-white text-lg">Cargando estadísticas…</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-800 to-blue-600 overflow-hidden">
      {/* Formas flotantes */}
      <div className="absolute top-8 left-8 w-40 h-40 bg-white opacity-10 rounded-full animate-float" />
      <div className="absolute bottom-12 right-16 w-72 h-72 bg-white opacity-5 rounded-full" />

      {/* Contenedor principal */}
      <div className="relative z-10 w-full max-w-6xl px-4 pt-24 pb-12 space-y-10">
        {/* Título */}
        <h1 className="text-4xl font-extrabold text-white text-center">
          Bienvenido, <span className="text-secondary">{user.name}</span>
        </h1>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsConfig.map(s => (
            <div
              key={s.key}
              className="flex items-center space-x-4 bg-white bg-opacity-20 backdrop-blur-lg p-5 rounded-2xl shadow-xl"
            >
              <div className="p-2 bg-white bg-opacity-30 rounded-full">
                {s.icon}
              </div>
              <div>
                <p className="text-sm text-gray-200">{s.label}</p>
                <p className="text-2xl font-bold text-white">{stats[s.key]}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Progreso general */}
        <div className="bg-white bg-opacity-20 backdrop-blur-lg p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-4">Tu progreso general</h2>
          <div className="w-full bg-white bg-opacity-30 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 bg-white transition-all"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
          <p className="mt-2 text-white">{stats.progress}% completado</p>
        </div>
      </div>
    </div>
  );
}
