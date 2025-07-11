// src/components/ProgressBar.jsx
import React from 'react';

export default function ProgressBar({ percentage }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div
        className="h-3 bg-gradient-to-r from-secondary to-primary transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
