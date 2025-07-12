// frontend/src/components/EvolutionChart.jsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const EvolutionChart = ({ attempts }) => {
  // Preparamos los datos para el gráfico
  const chartData = {
    labels: attempts.map(a => new Date(a.createdAt).toLocaleDateString('es-ES')).reverse(),
    datasets: [
      {
        label: 'Nota por Intento',
        data: attempts.map(a => a.score).reverse(),
        fill: true,
        backgroundColor: 'rgba(20, 184, 166, 0.2)',
        borderColor: '#14B8A6',
        pointBackgroundColor: '#14B8A6',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#14B8A6',
        tension: 0.3,
      },
    ],
  };

  // Opciones de personalización del gráfico
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      x: {
        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div className="h-64 md:h-80">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default EvolutionChart;