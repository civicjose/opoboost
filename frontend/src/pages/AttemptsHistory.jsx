import React, { useState, useEffect } from 'react';
import api from '../api/auth';
import { BookCopy, Check, X, Hash, Calendar } from 'lucide-react';

export default function AttemptsHistory() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/attempts')
      .then(res => {
        setAttempts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching history:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="pt-24 text-center text-white">Cargando historial...</p>;
  }

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-800 to-blue-600 overflow-hidden pt-24 pb-12">
      <div className="relative z-10 w-full max-w-4xl px-4 space-y-8">
        <h1 className="text-4xl font-extrabold text-white text-center">Historial de Intentos</h1>
        <div className="space-y-4">
          {attempts.length > 0 ? (
            attempts.map(att => (
              <div key={att._id} className="bg-white bg-opacity-20 backdrop-blur-lg p-5 rounded-xl shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <BookCopy className="text-white" />
                      <h2 className="text-xl font-semibold text-white">{att.testDef.title}</h2>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-200 mt-1">
                      <Calendar size={16} />
                      <span>{new Date(att.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{att.score}/10</p>
                    <div className="flex space-x-4 justify-end text-white mt-1">
                      <span className="flex items-center"><Check size={16} className="text-green-400 mr-1"/> {att.aciertos}</span>
                      <span className="flex items-center"><X size={16} className="text-red-400 mr-1"/> {att.fallos}</span>
                      <span className="flex items-center"><Hash size={16} className="text-yellow-400 mr-1"/> {att.vacias}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-white">No has realizado ningún test todavía.</p>
          )}
        </div>
      </div>
    </div>
  );
}