// src/pages/Test.jsx
import { useState, useEffect } from 'react';
import {
  createTest,
  createTestByTopic,
  submitTest
} from '../api/tests';
import { getTopics } from '../api/questions';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Test() {
  // Estado global
  const [topics, setTopics]       = useState([]);
  const [mode, setMode]           = useState('select'); // 'select', 'quiz'
  const [selectedTopic, setTopic] = useState(null);
  const [testId, setTestId]       = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers]     = useState({});
  const [step, setStep]           = useState(0);

  // 1. Cargo la lista de temas al montar
  useEffect(() => {
    getTopics().then(res => setTopics(res.data));
  }, []);

  // 2. Cuando el alumno elige “Test aleatorio” sin tema
  const startRandom = async () => {
    const res = await createTest();
    setTestId(res.data.testId);
    setQuestions(res.data.questions);
    setMode('quiz');
  };

  // 3. Cuando elige un tema concreto
  const startByTopic = async topic => {
    const res = await createTestByTopic(topic);
    setTestId(res.data.testId);
    setQuestions(res.data.questions);
    setMode('quiz');
  };

  // 4. Navegación del cuestionario
  const next = () => setStep(s => Math.min(s + 1, questions.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  // 5. Enviar respuestas
  const onSubmit = async () => {
    const formatted = Object.entries(answers).map(([q, a]) => ({
      question: q,
      answer: Number(a)
    }));
    const res = await submitTest({ testId, answers: formatted });
    alert(`Puntuación: ${res.data.score} / ${res.data.maxScore}`);
    // Reset parcial
    setMode('select');
    setTopic(null);
    setTestId(null);
    setQuestions([]);
    setAnswers({});
    setStep(0);
  };

  // ** UI **  
  if (mode === 'select') {
    return (
      <div className="pt-24 max-w-3xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Elige tu simulacro</h1>
        <div className="space-y-4">
          <button
            onClick={startRandom}
            className="w-full bg-secondary text-white py-3 rounded-lg shadow-card hover:bg-secondary/90 transition"
          >
            Test Aleatorio (10 preguntas)
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">O por tema:</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topics.map(t => (
                <button
                  key={t._id}
                  onClick={() => startByTopic(t._id)}
                  className="bg-white p-4 rounded-lg shadow-card hover:shadow-lg transition text-gray-800 text-left"
                >
                  <span className="font-medium">{t._id}</span>
                  <p className="text-sm text-muted mt-1">{t.title}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ** Quiz **  
  const q = questions[step];
  const progress = Math.round(((step + 1) / questions.length) * 100);

  return (
    <div className="pt-24 max-w-3xl mx-auto bg-white bg-opacity-80 backdrop-blur-lg p-6 rounded-2xl shadow-xl">
      <div className="h-2 w-full bg-muted/30 rounded-full mb-6 overflow-hidden">
        <div className="h-2 bg-secondary" style={{ width: `${progress}%` }} />
      </div>

      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        {step + 1}. {q.text}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {q.options.map((opt, i) => (
          <label
            key={i}
            className={`p-4 border rounded-lg cursor-pointer transition 
              ${answers[q._id] == i 
                ? 'border-secondary bg-secondary/10' 
                : 'border-gray-300 hover:border-secondary/50'}`}
          >
            <input
              type="radio"
              name={q._id}
              value={i}
              className="hidden"
              checked={answers[q._id] == i}
              onChange={() =>
                setAnswers(a => ({ ...a, [q._id]: i }))
              }
            />
            {opt.text}
          </label>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={prev}
          disabled={step === 0}
          className="px-4 py-2 bg-muted/20 rounded-md hover:bg-muted/40 transition disabled:opacity-50"
        >
          <ChevronLeft size={20} /> Anterior
        </button>
        {step < questions.length - 1 ? (
          <button
            onClick={next}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition"
          >
            Siguiente <ChevronRight size={20} />
          </button>
        ) : (
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition"
          >
            Enviar Test
          </button>
        )}
      </div>
    </div>
  );
}
