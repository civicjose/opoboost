import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { getTestDefinitionById, submitTest, getAttemptById } from '../api/tests';
import { useTestExit, TestExitContext } from '../contexts/TestExitContext';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Clock, BookCheck, AlertTriangle } from 'lucide-react';

// --- Sub-componente: Grid de Navegación de Preguntas ---
const QuestionGrid = ({ count, currentIdx, answeredIds, onSelect }) => (
    <div className="bg-white/20 backdrop-blur-lg p-4 rounded-2xl shadow-xl">
        <h3 className="text-white font-semibold mb-3">Navegación</h3>
        <div className="flex flex-wrap gap-2">
            {Array.from({ length: count }, (_, i) => {
                const isAnswered = answeredIds.has(i);
                const isCurrent = i === currentIdx;
                let baseClass = "transition font-bold rounded-md flex items-center justify-center";
                let sizeClass = "w-8 h-8";
                let colorClass = "bg-black/30 hover:bg-black/50 text-white";
                if (isAnswered) colorClass = 'bg-secondary/50 hover:bg-secondary/70 text-white';
                if (isCurrent) colorClass = 'bg-white text-black ring-2 ring-offset-2 ring-offset-transparent ring-white';

                return (
                    <button
                        key={i}
                        onClick={() => onSelect(i)}
                        className={`${baseClass} ${sizeClass} ${colorClass}`}
                    >
                        {i + 1}
                    </button>
                );
            })}
        </div>
    </div>
);

// --- Componente Modal de Salida ---
const ExitModal = () => {
    const { isExitModalOpen, confirmAndNavigate, cancelExit } = useTestExit();
    if (!isExitModalOpen) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
            <div className="relative bg-gray-800 text-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-white/20 text-center">
                <XCircle size={32} className="text-red-500 mx-auto mb-2"/>
                <h3 className="text-xl font-semibold mb-2">¿Seguro que quieres salir?</h3>
                <p className="mb-4 text-gray-300">Perderás todo tu progreso en este test.</p>
                <div className="flex justify-end space-x-4">
                    <button onClick={cancelExit} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500">Cancelar</button>
                    <button onClick={confirmAndNavigate} className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500 font-bold">Sí, Salir</button>
                </div>
            </div>
        </div>
    );
};

// --- NUEVO Componente Modal para Confirmar Finalización ---
const FinishModal = ({ isOpen, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
            <div className="relative bg-gray-800 text-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-white/20 text-center">
                <AlertTriangle size={32} className="text-yellow-400 mx-auto mb-2"/>
                <h3 className="text-xl font-semibold mb-2">¿Terminar el test?</h3>
                <p className="mb-4 text-gray-300">Una vez finalizado, se calculará tu nota y no podrás cambiar tus respuestas.</p>
                <div className="flex justify-end space-x-4">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500">Cancelar</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/90 font-bold">Sí, Terminar</button>
                </div>
            </div>
        </div>
    );
};

export default function TestDetail() {
    const { cat, testId, attemptId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { attemptToNavigate, setIsTestInProgress } = useContext(TestExitContext);

    const isReview = location.pathname.startsWith('/history/review');
    const isSimulacro = location.pathname.startsWith('/simulacro');
    const testMode = isReview ? 'review' : (searchParams.get('mode') || 'normal');
    
    const getInitialStage = () => {
        if (isReview) return 'review';
        if (testMode === 'study') return 'study';
        return 'taking';
    };

    const [td, setTd] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [idx, setIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [answeredQuestionIndexes, setAnsweredQuestionIndexes] = useState(new Set());
    const [stage, setStage] = useState(getInitialStage);
    const [result, setResult] = useState(null);
    const duration = location.state?.duration;
    const [timeLeft, setTimeLeft] = useState(duration ? duration * 60 : null);
    const timerRef = useRef(null);
    const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);

    useEffect(() => {
        setIsTestInProgress(stage === 'taking');
        return () => setIsTestInProgress(false);
    }, [stage, setIsTestInProgress]);

    useEffect(() => {
        const loadDataAndSetup = async () => {
            try {
                let testDefinition;
                if (isReview) {
                    const res = await getAttemptById(attemptId);
                    testDefinition = res.data.testDef;
                    const userAnswers = res.data.answers.reduce((acc, ans) => { acc[ans.question] = ans.answer; return acc; }, {});
                    setAnswers(userAnswers);
                } else {
                    const res = await getTestDefinitionById(testId);
                    testDefinition = res.data;
                }
                
                if (testDefinition) {
                    const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);
                    let processedQuestions = [...testDefinition.questions];
                    
                    if (testMode === 'random' && !isReview) {
                        processedQuestions = shuffleArray(processedQuestions);
                    }
                    
                    processedQuestions = processedQuestions.map(q => {
                        const optionsWithIndex = q.options.map((opt, index) => ({...opt, originalIndex: index}));
                        return {
                            ...q,
                            originalOptions: optionsWithIndex,
                            shuffledOptions: (testMode === 'random' && !isReview) ? shuffleArray(optionsWithIndex) : optionsWithIndex
                        };
                    });

                    setTd(testDefinition);
                    setQuestions(processedQuestions);
                }
            } catch (error) {
                console.error("Error al cargar y procesar el test:", error);
            }
        };
        loadDataAndSetup();
    }, [attemptId, testId, isReview, testMode]);

    const selectAnswer = (questionId, answerIndex) => { setAnswers(prev => { if (prev[questionId] === answerIndex) { const newAnswers = { ...prev }; delete newAnswers[questionId]; return newAnswers; } return { ...prev, [questionId]: answerIndex }; }); };
    useEffect(() => { const answeredIndexes = new Set(); questions.forEach((q, index) => { if (answers[q._id] !== undefined) { answeredIndexes.add(index); } }); setAnsweredQuestionIndexes(answeredIndexes); }, [answers, questions]);
    
    const finish = async () => {
        if (stage !== 'taking' || !td) return;
        if (timerRef.current) clearInterval(timerRef.current);
        
        let ac = 0, fa = 0, va = 0;
        questions.forEach(q => {
            const userAnswerIndex = answers[q._id];
            if (userAnswerIndex === undefined) {
                va++;
            } else {
                const correctOriginalIndex = q.correct;
                const selectedOption = q.shuffledOptions[userAnswerIndex];
                if (selectedOption && selectedOption.originalIndex === correctOriginalIndex) {
                    ac++;
                } else {
                    fa++;
                }
            }
        });
    
        const rawScore = td.questions.length > 0 ? Math.max(0, ac - (fa / 4)) / td.questions.length * 10 : 0;
        const finalScore = Number(rawScore.toFixed(2));
    
        await submitTest({
          testDef: td._id,
          answers: Object.entries(answers).map(([qid, answerIndex]) => {
          const question = questions.find(q => q._id === qid);
          const selectedOption = question.shuffledOptions[answerIndex];
          const isCorrect = selectedOption && selectedOption.originalIndex === question.correct;
          return { question: qid, answer: answerIndex, isCorrect: isCorrect };
            }),
          aciertos: ac, fallos: fa, vacias: va, score: finalScore, duration: duration || 0
        });
    
        setResult({ ac, fa, va, score: finalScore });
        setStage('finished');
    };
    
    const handleConfirmFinish = () => {
        setIsFinishModalOpen(false);
        finish();
    };

    useEffect(() => { if (stage === 'taking' && duration && td) { timerRef.current = setInterval(() => { setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); finish(); return 0; } return t - 1; }); }, 1000); } return () => clearInterval(timerRef.current); }, [stage, duration, td]);
    
    const handleGoBack = () => { const backPath = isReview ? '/history' : (isSimulacro ? '/test' : `/categories/${cat}`); navigate(backPath); };
    const review = () => setStage('review');
    const formatTime = (seconds) => { if (seconds === null) return ''; const mins = Math.floor(seconds / 60); const secs = seconds % 60; return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`; };

    if (!td || questions.length === 0) { return <p className="pt-24 text-center text-white">Cargando test...</p>; }
    const currentQuestion = questions[idx];
    const optionsToShow = currentQuestion.shuffledOptions;

    return (
        <div className="relative flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-800 to-blue-600 overflow-hidden">
            <div className="absolute top-8 left-8 w-40 h-40 bg-white opacity-10 rounded-full animate-float" />
            <div className="absolute bottom-12 right-16 w-72 h-72 bg-white opacity-5 rounded-full" />
            <ExitModal />
            <FinishModal 
                isOpen={isFinishModalOpen}
                onConfirm={handleConfirmFinish}
                onCancel={() => setIsFinishModalOpen(false)}
            />
            <div className="relative z-10 w-full max-w-4xl px-4 pt-24 pb-12 space-y-8">
                {stage === 'taking' && currentQuestion && (<> 
                    <QuestionGrid count={questions.length} currentIdx={idx} answeredIds={answeredQuestionIndexes} onSelect={setIdx}/> 
                    <div className="flex justify-between items-center text-white">
                        <span className="font-semibold">{idx + 1} / {questions.length}</span>
                        {timeLeft !== null && (<div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full"><Clock size={16} /><span className="font-mono">{formatTime(timeLeft)}</span></div>)}
                        <div className="flex space-x-4">
                            <button onClick={() => attemptToNavigate(isSimulacro ? '/test' : `/categories/${cat}`)} className="bg-white/10 px-4 py-2 rounded-lg text-sm hover:bg-white/20 transition">Salir</button>
                            <button onClick={() => setIsFinishModalOpen(true)} className="bg-secondary text-white px-4 py-2 rounded-lg shadow hover:bg-secondary/90 transition">Terminar Test</button>
                        </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-lg p-6 rounded-2xl shadow-xl text-white space-y-4">
                        <p className="font-semibold text-lg">{currentQuestion.text}</p>
                        <ul className="space-y-3">{optionsToShow.map((opt, i) => (<li key={i}><button onClick={() => selectAnswer(currentQuestion._id, i)} className={`w-full text-left p-3 rounded-lg border transition ${answers[currentQuestion._id] === i ? 'bg-secondary text-white' : 'bg-white bg-opacity-50 text-gray-800 hover:bg-opacity-70'}`}>{opt.text}</button></li>))}</ul>
                        <div className="flex justify-between pt-4">
                            <button onClick={() => setIdx(x => Math.max(0, x - 1))} disabled={idx === 0} className="disabled:opacity-50 flex items-center text-white"><ArrowLeft className="mr-2" />Anterior</button>
                            <button onClick={() => setIdx(x => Math.min(questions.length - 1, x + 1))} disabled={idx === questions.length - 1} className="disabled:opacity-50 flex items-center text-white">Siguiente<ArrowRight className="ml-2" /></button>
                        </div>
                    </div>
                </>)}
                {stage === 'finished' && result && (<div className="bg-white bg-opacity-20 backdrop-blur-lg p-8 rounded-2xl shadow-xl text-white space-y-6 text-center"><div className="flex items-center justify-center space-x-3"><CheckCircle size={32} className="text-green-400" /><h2 className="text-2xl font-bold">Test Finalizado</h2></div><p className="text-xl">Tu nota: <span className="font-bold text-3xl">{result.score}</span> / 10</p><div className="flex justify-center space-x-8"><div><strong>{result.ac}</strong> aciertos</div><div><strong>{result.fa}</strong> fallos</div><div><strong>{result.va}</strong> en blanco</div></div><div className="flex justify-center space-x-4 pt-4"><button onClick={review} className="bg-primary text-white px-6 py-2 rounded-full shadow hover:bg-primary/90 transition">Revisar Test</button><button onClick={handleGoBack} className="bg-secondary text-white px-6 py-2 rounded-full shadow hover:bg-secondary/90 transition">Volver</button></div></div>)}
                
                {stage === 'study' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center"><h2 className="text-3xl font-bold text-white flex items-center"><BookCheck className="mr-3"/>Modo Estudio: {td.title}</h2><button onClick={handleGoBack} className="bg-secondary text-white px-6 py-2 rounded-full shadow hover:bg-secondary/90 transition">Volver</button></div>
                        {questions.map((quest, i) => {
                            const correctOptionText = quest.options[quest.correct]?.text || "Respuesta no disponible";
                            return (
                                <div key={quest._id} className="bg-white/20 backdrop-blur-lg p-5 rounded-xl shadow-lg">
                                    <p className="font-semibold text-white mb-3">{i + 1}. {quest.text}</p>
                                    <div className="p-3 rounded-lg text-white bg-green-500/30 font-bold border-l-4 border-green-400">
                                        {correctOptionText}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {stage === 'review' && (<div className="space-y-6"><div className="flex justify-between items-center"><h2 className="text-3xl font-bold text-white flex items-center"><BookCheck className="mr-3"/>Revisión del Test</h2><button onClick={handleGoBack} className="bg-secondary text-white px-6 py-2 rounded-full shadow hover:bg-secondary/90 transition">Volver</button></div>{questions.map((quest, i) => { const userAnswerIndex = answers[quest._id]; const correctOriginalIndex = quest.correct; const optionsForReview = quest.shuffledOptions; const shuffledCorrectIndex = optionsForReview.findIndex(opt => opt.originalIndex === correctOriginalIndex); const isCorrect = userAnswerIndex === shuffledCorrectIndex; const status = userAnswerIndex === undefined ? 'vacia' : isCorrect ? 'acierto' : 'fallo'; const statusStyles = {acierto: { border: 'border-green-500', bg: 'bg-green-900/30' },fallo: { border: 'border-red-500', bg: 'bg-red-900/30' },vacia: { border: 'border-yellow-500', bg: 'bg-yellow-900/30' }}; return (<div key={quest._id} className={`border-l-4 p-4 rounded-lg text-white ${statusStyles[status].border} ${statusStyles[status].bg}`}><p className="font-semibold mb-2">{i + 1}. {quest.text}</p><p className="text-sm"><strong className="text-gray-300">Tu respuesta: </strong>{status === 'vacia' ? <em className="text-yellow-400">Sin responder</em> : <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>{optionsForReview[userAnswerIndex]?.text || 'Opción no válida'}</span>}</p>{status === 'fallo' && (<p className="text-sm"><strong className="text-gray-300">Respuesta correcta: </strong><span className="text-green-400">{optionsForReview[shuffledCorrectIndex]?.text}</span></p>)}</div>);})}</div>)}
            </div>
        </div>
    );
}