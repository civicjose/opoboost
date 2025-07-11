// frontend/src/pages/Test.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTest } from '../api/tests';
import { BookOpen, Clock, Hash } from 'lucide-react';

export default function Test() {
  const [numQuestions, setNumQuestions] = useState(10);
  const [timeHours, setTimeHours] = useState(0);
  const [timeMinutes, setTimeMinutes] = useState(15);
  const navigate = useNavigate();

  const startRandomTest = async () => {
    if (numQuestions <= 0) {
      alert('El número de preguntas debe ser mayor que cero.');
      return;
    }
    const totalMinutes = (timeHours * 60) + timeMinutes;
    if (totalMinutes <= 0) {
      alert('La duración del test debe ser mayor que cero.');
      return;
    }

    try {
      const res = await createTest(numQuestions);
      if (!res.data || res.data.questions.length === 0) {
        alert('No se encontraron suficientes preguntas para generar el simulacro.');
        return;
      }
      
      navigate(`/simulacro/${res.data._id}`, { 
        state: { 
          testData: res.data,
          duration: totalMinutes 
        } 
      });
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error al crear el simulacro. Asegúrate de que haya preguntas en la base de datos.';
        alert(errorMessage);
    }
  };

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-800 to-blue-600 overflow-hidden pt-24 pb-12 px-4">
      <div className="absolute top-8 left-8 w-40 h-40 bg-white opacity-10 rounded-full animate-float" />
      <div className="absolute bottom-12 right-16 w-72 h-72 bg-white opacity-5 rounded-full" />

      <div className="relative z-10 w-full max-w-3xl space-y-8">
        <h1 className="text-4xl font-extrabold text-white text-center">Configura tu Simulacro</h1>
        
        <div className="bg-white bg-opacity-20 backdrop-blur-lg p-6 rounded-2xl shadow-xl space-y-6">
          <h2 className="text-xl font-semibold text-white text-center">Simulacro General</h2>
          
          <div>
            <label htmlFor="num-questions" className="flex items-center space-x-2 text-white font-medium mb-2">
              <Hash size={20} />
              <span>Número de Preguntas</span>
            </label>
            <input
              id="num-questions"
              type="number"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              min="1"
              className="w-full bg-white/30 text-white placeholder-gray-300 p-3 rounded-lg border-2 border-transparent focus:border-white focus:outline-none transition"
              placeholder="Ej: 25"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-white font-medium mb-2">
              <Clock size={20} />
              <span>Tiempo Límite</span>
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  id="time-hours"
                  type="number"
                  value={timeHours}
                  onChange={(e) => setTimeHours(Number(e.target.value))}
                  min="0"
                  className="w-full bg-white/30 text-white placeholder-gray-300 p-3 rounded-lg border-2 border-transparent focus:border-white focus:outline-none transition"
                  placeholder="Horas"
                />
                <label htmlFor="time-hours" className="text-xs text-gray-200 pl-1">Horas</label>
              </div>
              <div className="flex-1">
                <input
                  id="time-minutes"
                  type="number"
                  value={timeMinutes}
                  onChange={(e) => setTimeMinutes(Number(e.target.value))}
                  min="0"
                  className="w-full bg-white/30 text-white placeholder-gray-300 p-3 rounded-lg border-2 border-transparent focus:border-white focus:outline-none transition"
                  placeholder="Minutos"
                />
                 <label htmlFor="time-minutes" className="text-xs text-gray-200 pl-1">Minutos</label>
              </div>
            </div>
          </div>

          <button
            onClick={startRandomTest}
            className="w-full bg-secondary text-white py-3 rounded-lg shadow-lg hover:bg-secondary/90 transition flex items-center justify-center space-x-2 font-bold"
          >
            <BookOpen size={20} />
            <span>Empezar Test Aleatorio</span>
          </button>
        </div>
      </div>
    </div>
  );
}