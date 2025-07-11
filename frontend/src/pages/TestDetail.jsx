// src/pages/TestDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate }        from 'react-router-dom';
import { getTestDefinitionById, submitTest } from '../api/tests';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle } from 'lucide-react';

export default function TestDetail() {
  const { cat, testId } = useParams();
  const nav             = useNavigate();

  const [td, setTd]             = useState(null);
  const [idx, setIdx]           = useState(0);
  const [answers, setAnswers]   = useState({});
  const [stage, setStage]       = useState('taking'); // taking | finished | review
  const [result, setResult]     = useState(null);
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    getTestDefinitionById(testId).then(r => setTd(r.data));
  }, [testId]);

  if (!td) {
    return <p className="pt-24 text-center text-white">Cargando…</p>;
  }

  const qs     = td.questions || [];
  const total  = qs.length;
  const q      = qs[idx];
  const pr     = Math.round(((idx + 1) / total) * 100);

  const select = i => setAnswers(a => ({ ...a, [q._id]: i }));

  const finish = async () => {
    let ac = 0, fa = 0, va = 0;
    qs.forEach(x => {
      if (!(x._id in answers)) return va++;
      answers[x._id] === x.correct ? ac++ : fa++;
    });
    const raw = Math.max(0, ac - Math.floor(fa/2)) / total * 10;
    const score = Number(raw.toFixed(2));

    await submitTest({
      testDef: testId,
      answers: Object.entries(answers).map(([qid, a]) => ({ question: qid, answer: a })),
      aciertos: ac, fallos: fa, vacias: va, score
    });

    setResult({ ac, fa, va, score });
    setStage('finished');
  };

  const review     = () => setStage('review');
  const confirmExit= () => { setShowExitModal(false); nav(`/categories/${cat}`); };
  const cancelExit = () => setShowExitModal(false);

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-800 to-blue-600 overflow-hidden">
      {/* Formas flotantes */}
      <div className="absolute top-8 left-8 w-40 h-40 bg-white opacity-10 rounded-full animate-float"/>
      <div className="absolute bottom-12 right-16 w-72 h-72 bg-white opacity-5 rounded-full"/>

      <div className="relative z-10 w-full max-w-6xl px-4 pt-24 pb-12 space-y-8">
        {/* Tomando test */}
        {stage === 'taking' && (
          <>
            {/* Header: progreso, salir, terminar */}
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold">{idx+1} / {total}</span>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowExitModal(true)}
                  className="text-white underline text-sm"
                >
                  Salir
                </button>
                <button
                  onClick={finish}
                  className="bg-secondary text-white px-4 py-2 rounded-lg shadow hover:bg-secondary/90 transition"
                >
                  Terminar Test
                </button>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="w-full bg-white bg-opacity-30 h-3 rounded-full overflow-hidden mb-6">
              <div
                className="h-3 bg-white transition-all"
                style={{ width: `${pr}%` }}
              />
            </div>

            {/* Pregunta */}
            <div className="bg-white bg-opacity-20 backdrop-blur-lg p-6 rounded-2xl shadow-xl text-white space-y-4">
              <p className="font-semibold text-lg">{q.text}</p>
              <ul className="space-y-3">
                {q.options.map((opt,i) => (
                  <li key={i}>
                    <button
                      onClick={() => select(i)}
                      className={`w-full text-left p-3 rounded-lg border transition ${
                        answers[q._id] === i
                          ? 'bg-secondary text-white'
                          : 'bg-white bg-opacity-50 text-gray-800 hover:bg-opacity-70'
                      }`}
                    >
                      {opt.text}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between">
                <button
                  onClick={() => setIdx(x => Math.max(0, x-1))}
                  disabled={idx === 0}
                  className="disabled:opacity-50 flex items-center text-white"
                >
                  <ArrowLeft className="mr-2"/>Anterior
                </button>
                <button
                  onClick={() => setIdx(x => Math.min(total-1, x+1))}
                  disabled={idx === total-1}
                  className="disabled:opacity-50 flex items-center text-white"
                >
                  Siguiente<ArrowRight className="ml-2"/>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Resultado */}
        {stage === 'finished' && result && (
          <div className="bg-white bg-opacity-20 backdrop-blur-lg p-8 rounded-2xl shadow-xl text-white space-y-6">
            <div className="flex items-center space-x-3">
              <CheckCircle size={32} className="text-green-400"/>
              <h2 className="text-2xl font-bold">Test Finalizado</h2>
            </div>
            <p className="text-xl">
              Tu nota: <span className="font-semibold">{result.score}</span> / 10
            </p>
            <div className="flex space-x-8">
              <div><strong>{result.ac}</strong> aciertos</div>
              <div><strong>{result.fa}</strong> fallos</div>
              <div><strong>{result.va}</strong> en blanco</div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={review}
                className="bg-primary text-white px-6 py-2 rounded-full shadow hover:bg-primary/90 transition"
              >
                Revisar Test
              </button>
              <button
                onClick={() => nav(`/categories/${cat}`)}
                className="bg-secondary text-white px-6 py-2 rounded-full shadow hover:bg-secondary/90 transition"
              >
                Volver
              </button>
            </div>
          </div>
        )}

        {/* Revisión */}
        {stage === 'review' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Revisión del Test</h2>
            {qs.map((quest, i) => {
              const your = answers[quest._id];
              const status = !(quest._id in answers)
                ? 'vacia'
                : your === quest.correct
                  ? 'acierto'
                  : 'fallo';
              const bg = {
                acierto: 'bg-green-100 border-green-500',
                fallo:   'bg-red-100 border-red-500',
                vacia:   'bg-yellow-100 border-yellow-500'
              }[status];
              return (
                <div
                  key={quest._id}
                  className={`border-l-4 p-4 rounded-lg bg-white bg-opacity-20 backdrop-blur-lg ${bg}`}
                >
                  <p className="font-semibold mb-2">{i+1}. {quest.text}</p>
                  <p>
                    Tu respuesta:{' '}
                    {status === 'vacia'
                      ? <em className="text-yellow-700">Sin responder</em>
                      : <span className={status==='acierto'? 'text-green-700':'text-red-700'}>
                          {quest.options[your].text}
                        </span>}
                  </p>
                  <p>
                    Correcta: <span className="text-green-700">{quest.options[quest.correct].text}</span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal confirmar salida */}
      {showExitModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50" onClick={cancelExit}/>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <XCircle size={32} className="text-red-500 mb-2"/>
            <h3 className="text-xl font-semibold mb-2">¿Seguro que quieres salir?</h3>
            <p className="mb-4">Perderás todo tu progreso.</p>
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
