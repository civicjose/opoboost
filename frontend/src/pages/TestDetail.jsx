// frontend/src/pages/TestDetail.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getTestDefinitionById, submitTest } from '../api/tests';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function TestDetail() {
  const { cat, testId } = useParams();
  const nav = useNavigate();
  const location = useLocation();

  // Determinamos si es un simulacro basándonos en la ruta
  const isSimulacro = location.pathname.startsWith('/simulacro');

  const [td, setTd] = useState(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [stage, setStage] = useState('taking'); // 'taking' | 'finished' | 'review'
  const [result, setResult] = useState(null);
  const [showExitModal, setShowExitModal] = useState(false);

  // --- Lógica del Temporizador ---
  const duration = location.state?.duration; // en minutos
  const [timeLeft, setTimeLeft] = useState(duration ? duration * 60 : null);
  const timerRef = useRef(null);

  // --- Función para finalizar el test ---
  const finish = async () => {
    // Evita que se llame múltiples veces si el estado ya no es 'taking'
    if (stage !== 'taking' || !td) return; 
    
    // Detiene el temporizador para que no siga corriendo
    if (timerRef.current) clearInterval(timerRef.current);
    
    let ac = 0, fa = 0, va = 0;
    td.questions.forEach(x => {
      if (!(x._id in answers)) {
        va++;
      } else {
        answers[x._id] === x.correct ? ac++ : fa++;
      }
    });

    const raw = td.questions.length > 0 ? Math.max(0, ac - Math.floor(fa / 2)) / td.questions.length * 10 : 0;
    const score = Number(raw.toFixed(2));

    await submitTest({
      testDef: td._id, // Siempre usamos el ID real del TestDefinition
      answers: Object.entries(answers).map(([qid, a]) => ({ question: qid, answer: a })),
      aciertos: ac,
      fallos: fa,
      vacias: va,
      score,
      duration: duration || 0
    });

    setResult({ ac, fa, va, score });
    setStage('finished'); // Cambia el estado para mostrar la pantalla de resultados
  };

  // --- Efecto para cargar datos del test ---
  useEffect(() => {
    const currentTestId = isSimulacro ? testId : (location.state?.testData?._id || testId);
    
    if (location.state?.testData && location.state.testData._id === currentTestId) {
      setTd(location.state.testData);
    } else if (currentTestId) {
      getTestDefinitionById(currentTestId)
        .then(r => setTd(r.data))
        .catch(err => console.error("Error cargando el test:", err));
    }
  }, [testId, isSimulacro, location.state]);

  // --- Efecto para el ciclo de vida del temporizador ---
  useEffect(() => {
    if (stage === 'taking' && duration && td) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            finish(); // Finaliza el test automáticamente
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    // Limpieza al desmontar o cambiar de estado
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage, duration, td]);

  // --- Funciones de navegación y modales ---
  const handleGoBack = () => {
    const backPath = isSimulacro ? '/test' : `/categories/${cat}`;
    nav(backPath);
  };

  const review = () => setStage('review');
  const confirmExit = () => {
    setShowExitModal(false);
    handleGoBack();
  };
  const cancelExit = () => setShowExitModal(false);

  const formatTime = (seconds) => {
    if (seconds === null) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const selectAnswer = (questionId, answerIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  if (!td) {
    return <p className="pt-24 text-center text-white">Cargando test...</p>;
  }

  const questions = td.questions || [];
  const total = questions.length;
  const currentQuestion = questions[idx];
  const progress = total > 0 ? Math.round(((idx + 1) / total) * 100) : 0;

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-800 to-blue-600 overflow-hidden">
      <div className="absolute top-8 left-8 w-40 h-40 bg-white opacity-10 rounded-full animate-float" />
      <div className="absolute bottom-12 right-16 w-72 h-72 bg-white opacity-5 rounded-full" />

      <div className="relative z-10 w-full max-w-6xl px-4 pt-24 pb-12 space-y-8">
        
        {stage === 'taking' && currentQuestion && (
          <>
            <div className="flex justify-between items-center text-white">
              <span className="font-semibold">{idx + 1} / {total}</span>
              {timeLeft !== null && (
                <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
                  <Clock size={16} />
                  <span className="font-mono">{formatTime(timeLeft)}</span>
                </div>
              )}
              <div className="flex space-x-4">
                <button onClick={() => setShowExitModal(true)} className="underline text-sm">Salir</button>
                <button onClick={finish} className="bg-secondary text-white px-4 py-2 rounded-lg shadow hover:bg-secondary/90 transition">Terminar Test</button>
              </div>
            </div>

            <div className="w-full bg-white bg-opacity-30 h-3 rounded-full overflow-hidden mb-6">
              <div className="h-3 bg-white transition-all" style={{ width: `${progress}%` }} />
            </div>

            <div className="bg-white bg-opacity-20 backdrop-blur-lg p-6 rounded-2xl shadow-xl text-white space-y-4">
              <p className="font-semibold text-lg">{currentQuestion.text}</p>
              <ul className="space-y-3">
                {currentQuestion.options.map((opt, i) => (
                  <li key={i}>
                    <button
                      onClick={() => selectAnswer(currentQuestion._id, i)}
                      className={`w-full text-left p-3 rounded-lg border transition ${answers[currentQuestion._id] === i ? 'bg-secondary text-white' : 'bg-white bg-opacity-50 text-gray-800 hover:bg-opacity-70'}`}
                    >
                      {opt.text}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between pt-4">
                <button onClick={() => setIdx(x => Math.max(0, x - 1))} disabled={idx === 0} className="disabled:opacity-50 flex items-center text-white"><ArrowLeft className="mr-2" />Anterior</button>
                <button onClick={() => setIdx(x => Math.min(total - 1, x + 1))} disabled={idx === total - 1} className="disabled:opacity-50 flex items-center text-white">Siguiente<ArrowRight className="ml-2" /></button>
              </div>
            </div>
          </>
        )}

        {stage === 'finished' && result && (
          <div className="bg-white bg-opacity-20 backdrop-blur-lg p-8 rounded-2xl shadow-xl text-white space-y-6 text-center">
            <div className="flex items-center justify-center space-x-3">
              <CheckCircle size={32} className="text-green-400" />
              <h2 className="text-2xl font-bold">Test Finalizado</h2>
            </div>
            <p className="text-xl">Tu nota: <span className="font-bold text-3xl">{result.score}</span> / 10</p>
            <div className="flex justify-center space-x-8">
              <div><strong>{result.ac}</strong> aciertos</div>
              <div><strong>{result.fa}</strong> fallos</div>
              <div><strong>{result.va}</strong> en blanco</div>
            </div>
            <div className="flex justify-center space-x-4 pt-4">
              <button onClick={review} className="bg-primary text-white px-6 py-2 rounded-full shadow hover:bg-primary/90 transition">Revisar Test</button>
              <button onClick={handleGoBack} className="bg-secondary text-white px-6 py-2 rounded-full shadow hover:bg-secondary/90 transition">Volver</button>
            </div>
          </div>
        )}

        {stage === 'review' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-white">Revisión del Test</h2>
              <button onClick={handleGoBack} className="bg-secondary text-white px-6 py-2 rounded-full shadow hover:bg-secondary/90 transition">Volver</button>
            </div>
            {questions.map((quest, i) => {
              const userAnswer = answers[quest._id];
              const isCorrect = userAnswer === quest.correct;
              const status = userAnswer === undefined ? 'vacia' : isCorrect ? 'acierto' : 'fallo';
              
              const statusStyles = {
                acierto: { border: 'border-green-500', bg: 'bg-green-900/30' },
                fallo: { border: 'border-red-500', bg: 'bg-red-900/30' },
                vacia: { border: 'border-yellow-500', bg: 'bg-yellow-900/30' }
              };
              
              return (
                <div key={quest._id} className={`border-l-4 p-4 rounded-lg text-white ${statusStyles[status].border} ${statusStyles[status].bg}`}>
                  <p className="font-semibold mb-2">{i + 1}. {quest.text}</p>
                  <p className="text-sm">
                    <strong className="text-gray-300">Tu respuesta: </strong>
                    {status === 'vacia' 
                      ? <em className="text-yellow-400">Sin responder</em> 
                      : <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>{quest.options[userAnswer]?.text || 'Opción no válida'}</span>
                    }
                  </p>
                  {!isCorrect && status !== 'vacia' && (
                     <p className="text-sm"><strong className="text-gray-300">Respuesta correcta: </strong><span className="text-green-400">{quest.options[quest.correct]?.text}</span></p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showExitModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50" onClick={cancelExit} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <XCircle size={32} className="text-red-500 mx-auto mb-2" />
            <h3 className="text-xl font-semibold mb-2">¿Seguro que quieres salir?</h3>
            <p className="mb-4 text-gray-600">Perderás todo tu progreso en este test.</p>
            <div className="flex justify-end space-x-4">
              <button onClick={cancelExit} className="px-4 py-2 bg-gray-200 rounded-lg">Cancelar</button>
              <button onClick={confirmExit} className="px-4 py-2 bg-red-500 text-white rounded-lg">Salir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}