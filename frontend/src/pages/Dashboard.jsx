// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { getStats } from '../api/stats';
import api from '../api/auth';
import EvolutionChart from '../components/EvolutionChart';
import { ClipboardList, CheckCircle, XCircle, BookOpen, ChevronRight, Activity, Target } from 'lucide-react';

const StatCard = ({ icon, label, value }) => (
  <div className="flex items-center space-x-4 bg-white bg-opacity-20 backdrop-blur-lg p-5 rounded-2xl shadow-xl">
    <div className="p-3 bg-white bg-opacity-30 rounded-full">{icon}</div>
    <div>
      <p className="text-sm text-gray-200">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [allAttempts, setAllAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, recentRes, allRes] = await Promise.all([
          getStats(),
          api.get('/attempts/history?limit=3'),
          api.get('/attempts/history')
        ]);
        setStats(statsRes.data);
        setRecentAttempts(recentRes.data);
        setAllAttempts(allRes.data);
      } catch (error) {
        console.error("Error al cargar los datos del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading || !stats) {
    return <div className="pt-24 text-center text-white">Cargando dashboard...</div>;
  }
  
  const statsConfig = [
    { key: 'totalTests', label: 'Tests realizados', icon: <ClipboardList size={28} className="text-white"/> },
    { key: 'correct',    label: 'Aciertos',        icon: <CheckCircle size={28} className="text-green-300"/> },
    { key: 'incorrect',  label: 'Fallos',          icon: <XCircle size={28} className="text-red-300"/> },
    { key: 'simulacros', label: 'Simulacros',      icon: <BookOpen size={28} className="text-yellow-300"/> }
  ];

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-800 to-blue-600 overflow-hidden">
      <div className="absolute top-8 left-8 w-40 h-40 bg-white opacity-10 rounded-full animate-float" />
      <div className="absolute bottom-12 right-16 w-72 h-72 bg-white opacity-5 rounded-full" />

      <div className="relative z-10 w-full max-w-7xl px-4 pt-24 pb-12 space-y-10">
        <h1 className="text-4xl font-extrabold text-white text-center">
          Bienvenido de nuevo, <span className="text-secondary">{user.name}</span>
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsConfig.map(s => <StatCard key={s.key} icon={s.icon} label={s.label} value={stats[s.key]} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda: Gráfico y Progreso General */}
          <div className="lg:col-span-2 space-y-8">
            {/* --- BARRA DE PROGRESO REINTEGRADA --- */}
            <div className="bg-white/20 backdrop-blur-lg p-6 rounded-2xl shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><Target/> Progreso General</h2>
              <p className="text-sm text-gray-300 mb-2">Porcentaje de tests únicos aprobados sobre el total disponible.</p>
              <div className="w-full bg-black/20 rounded-full h-4">
                  <div className="h-4 bg-green-400 rounded-full transition-all duration-500 text-center text-xs flex items-center justify-center font-bold text-green-900" style={{ width: `${stats.progress}%` }}>
                    {stats.progress > 10 && `${stats.progress}%`}
                  </div>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-lg p-6 rounded-2xl shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><Activity/> Tu Evolución</h2>
              {allAttempts.length > 1 ? (
                <EvolutionChart attempts={allAttempts} />
              ) : (
                <p className="text-center text-gray-300 py-16">Realiza al menos dos tests para ver tu progreso.</p>
              )}
            </div>
          </div>

          {/* Columna Derecha: Actividad Reciente y Atajos */}
          <div className="space-y-8">
             <div className="bg-white/20 backdrop-blur-lg p-6 rounded-2xl shadow-xl">
                <h2 className="text-xl font-semibold text-white mb-4">Continuar Estudiando</h2>
                <div className="space-y-3">
                    <button onClick={() => navigate('/test')} className="w-full text-left p-4 rounded-lg bg-secondary/80 hover:bg-secondary transition flex justify-between items-center text-white"><span>Iniciar Simulacro</span> <ChevronRight/></button>
                    <button onClick={() => navigate('/categories')} className="w-full text-left p-4 rounded-lg bg-primary/80 hover:bg-primary transition flex justify-between items-center text-white"><span>Ver Categorías</span> <ChevronRight/></button>
                </div>
             </div>
             <div className="bg-white/20 backdrop-blur-lg p-6 rounded-2xl shadow-xl">
                <h2 className="text-xl font-semibold text-white mb-4">Actividad Reciente</h2>
                <div className="space-y-3">
                    {recentAttempts.length > 0 ? recentAttempts.map(att => (
                        <div key={att._id} className="p-3 rounded-lg bg-black/20 flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-white">{att.testDef?.title || 'Test Eliminado'}</p>
                                <p className="text-sm text-gray-300">Nota: {att.score.toFixed(2)}</p>
                            </div>
                            <button onClick={() => navigate(`/history/review/${att._id}`)} className="text-sm text-secondary hover:underline">Revisar</button>
                        </div>
                    )) : <p className="text-gray-300 text-sm">Aún no has realizado ningún test.</p>}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}