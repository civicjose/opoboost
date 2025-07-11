// src/components/HeaderStats.jsx
import React from 'react';
import { ClipboardList, CheckCircle, XCircle, Clock } from 'lucide-react';

const statsConfig = [
  { key: 'totalTests',    label: 'Tests realizados',    icon: <ClipboardList size={24}/> },
  { key: 'correct',       label: 'Aciertos',            icon: <CheckCircle size={24}/> },
  { key: 'incorrect',     label: 'Fallos',              icon: <XCircle size={24}/> },
  { key: 'simulacros',    label: 'Simulacros',          icon: <Clock size={24}/> },
];

export default function HeaderStats({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsConfig.map(s => (
        <div
          key={s.key}
          className="relative overflow-hidden rounded-2xl p-5 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,1) 0%, rgba(168,85,247,1) 100%)'
          }}
        >
          <div className="absolute top-0 right-0 opacity-10 text-6xl">{s.icon}</div>
          <div className="relative">
            <h3 className="text-sm font-medium text-white">{s.label}</h3>
            <p className="mt-2 text-3xl font-bold text-white">{stats[s.key]}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
