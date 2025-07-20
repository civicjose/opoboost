import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCustomSimulacro, createFailedQuestionsSimulacro } from '../api/tests';
import { getCategories } from '../api/categories';
import api from '../api/auth';
import { BookCopy, Repeat, ShieldCheck, Loader, Check } from 'lucide-react';
import NotificationModal from '../components/NotificationModal'; // Importamos el modal reutilizable

// --- Componente para las Tarjetas de Modo ---
const ModeCard = ({ icon, title, description, isActive, onClick }) => (
    <button 
        onClick={onClick}
        className={`relative text-center p-6 rounded-2xl border-2 transition-all duration-300 w-full text-white ${isActive ? 'bg-secondary/30 border-secondary scale-105' : 'bg-white/10 border-transparent hover:border-white/50'}`}
    >
        <div className="flex justify-center mb-3">
            {React.cloneElement(icon, { size: 32 })}
        </div>
        <div>
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-sm text-white/80 mt-1">{description}</p>
        </div>
    </button>
);

export default function Test() {
    const [mode, setMode] = useState('study');
    const [numQuestions, setNumQuestions] = useState(25);
    const [timeMinutes, setTimeMinutes] = useState(30);
    const [selectedTestIds, setSelectedTestIds] = useState([]);
    const [availableContent, setAvailableContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [apiLoading, setApiLoading] = useState(false);
    const [modalInfo, setModalInfo] = useState({ isOpen: false, title: '', message: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const catRes = await getCategories();
                const sortedCategories = catRes.data.sort((a, b) => a.name.localeCompare(b.name));

                const testsPromises = sortedCategories.map(cat => api.get(`/tests/category-stats/${cat._id}`));
                const testsResults = await Promise.all(testsPromises);
                
                const categoriesWithTests = sortedCategories.map((cat, index) => {
                    const sortedTests = testsResults[index].data.tests.sort((a, b) => a.title.localeCompare(b.title));
                    return {
                        ...cat,
                        tests: sortedTests.filter(t => t.questions.length > 0)
                    };
                }).filter(cat => cat.tests.length > 0);

                setAvailableContent(categoriesWithTests);
            } catch (error) {
                console.error("Error al cargar contenido para simulacros:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    const studyModeInfo = useMemo(() => {
        const questionIds = new Set();
        availableContent.forEach(cat => {
            cat.tests.forEach(test => {
                if (selectedTestIds.includes(test._id)) {
                    test.questions.forEach(qId => questionIds.add(qId));
                }
            });
        });
        return { count: questionIds.size };
    }, [selectedTestIds, availableContent]);

    const realModeMaxQuestions = useMemo(() => {
        const questionIds = new Set();
        availableContent.forEach(cat => cat.tests.forEach(test => test.questions.forEach(qId => questionIds.add(qId))));
        return questionIds.size;
    }, [availableContent]);

    const handleTestSelection = (testId) => {
        setSelectedTestIds(prev => prev.includes(testId) ? prev.filter(id => id !== testId) : [...prev, testId]);
    };

    const startSimulacro = async () => {
        if (mode === 'study' && selectedTestIds.length === 0) {
            setModalInfo({ isOpen: true, title: 'Selección Requerida', message: 'Debes seleccionar al menos un test para crear un simulacro de estudio.' });
            return;
        }
        if (mode === 'real') {
            if (numQuestions <= 0 || timeMinutes <= 0) {
                setModalInfo({ isOpen: true, title: 'Datos Inválidos', message: 'El número de preguntas y el tiempo deben ser mayores que cero.' });
                return;
            }
            if (numQuestions > realModeMaxQuestions) {
                setModalInfo({ isOpen: true, title: 'Límite Excedido', message: `El número de preguntas no puede superar el máximo disponible (${realModeMaxQuestions}).` });
                return;
            }
        }

        setApiLoading(true);
        try {
            let res;
            if (mode === 'study') {
                res = await createCustomSimulacro({ 
                    testIds: selectedTestIds, 
                    mode: 'study',
                    title: `Simulacro de Estudio (${studyModeInfo.count} preguntas)`
                });
                navigate(`/simulacro/${res.data._id}?mode=random`, { state: { duration: null } });
            } else if (mode === 'failed') {
                res = await createFailedQuestionsSimulacro();
                navigate(`/simulacro/${res.data._id}?mode=random`, { state: { duration: null } });
            } else if (mode === 'real') {
                res = await createCustomSimulacro({ 
                    mode: 'real',
                    limit: numQuestions,
                    title: 'Simulacro de Examen Real'
                });
                navigate(`/simulacro/${res.data._id}?mode=random`, { state: { duration: timeMinutes } });
            }
        } catch (error) {
            setApiLoading(false);
            setModalInfo({ isOpen: true, title: 'Error Inesperado', message: error.response?.data?.message || 'No se pudo crear el simulacro.' });
        }
    };

    if (apiLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-800 to-blue-600 text-white">
                <Loader className="animate-spin" size={48} />
                <p className="mt-4 font-semibold">Generando tu simulacro, por favor espera...</p>
            </div>
        );
    }

    return (
        <div className="relative flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-800 to-blue-600 overflow-hidden pt-24 pb-12 px-4">
            <NotificationModal {...modalInfo} onClose={() => setModalInfo({ isOpen: false, title: '', message: '' })} />
            <div className="absolute top-8 left-8 w-40 h-40 bg-white opacity-10 rounded-full animate-float" />
            <div className="absolute bottom-12 right-16 w-72 h-72 bg-white opacity-5 rounded-full" />
            <div className="relative z-10 w-full max-w-4xl space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-white">Centro de Simulacros</h1>
                    <p className="text-white/80 mt-2 max-w-2xl mx-auto">Selecciona un modo de examen y configura tu prueba para empezar a practicar.</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                    <ModeCard 
                        icon={<BookCopy className="text-blue-300"/>}
                        title="Simulacro de Estudio"
                        description="Elige los tests que quieres incluir. Sin límite de tiempo."
                        isActive={mode === 'study'}
                        onClick={() => setMode('study')}
                    />
                    <ModeCard 
                        icon={<Repeat className="text-yellow-300"/>}
                        title="Repaso de Fallos"
                        description="Test con todas tus preguntas falladas. Sin límite de tiempo."
                        isActive={mode === 'failed'}
                        onClick={() => setMode('failed')}
                    />
                    <ModeCard 
                        icon={<ShieldCheck className="text-green-300"/>}
                        title="Examen Real"
                        description="Configura un examen con preguntas de todo el temario."
                        isActive={mode === 'real'}
                        onClick={() => setMode('real')}
                    />
                </div>

                <div className="bg-white/10 p-6 rounded-2xl">
                    {mode === 'study' && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white">Configuración de Estudio</h3>
                            <p className="text-white/80">Pulsa sobre los tests que quieres incluir en tu simulacro.</p>
                            <div className="max-h-60 overflow-y-auto bg-black/20 p-4 rounded-lg space-y-4">
                                {loading ? <p>Cargando contenido...</p> : availableContent.map(cat => (
                                    <div key={cat._id}>
                                        <h4 className="font-bold text-secondary mb-2">{cat.name}</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {cat.tests.map(test => {
                                                const isSelected = selectedTestIds.includes(test._id);
                                                return (
                                                    <button 
                                                        key={test._id}
                                                        onClick={() => handleTestSelection(test._id)}
                                                        className={`flex items-center gap-2 px-3 py-1 text-gray-200 rounded-full text-sm transition ${isSelected ? 'bg-secondary text-white' : 'bg-white/10 hover:bg-white/20'}`}
                                                    >
                                                        {isSelected && <Check size={16} />}
                                                        {test.title}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-center font-bold text-white mt-2">Total de preguntas seleccionadas: {studyModeInfo.count}</p>
                        </div>
                    )}

                    {mode === 'failed' && (
                        <div className="text-center py-8">
                            <Repeat size={40} className="mx-auto text-yellow-300"/>
                            <h3 className="text-xl font-bold text-white mt-4">Simulacro de Repaso</h3>
                            <p className="text-white/80 mt-2 max-w-md mx-auto">Se creará un test con todas las preguntas que has fallado. ¡Ideal para reforzar tus puntos débiles!</p>
                        </div>
                    )}
                    
                    {mode === 'real' && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white">Configuración de Examen Real</h3>
                            <p className="text-white/80">Define los parámetros de tu examen.</p>
                             <div className="grid md:grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="text-white block mb-1">Número de preguntas ({realModeMaxQuestions} disp.)</label>
                                    <input type="number" value={numQuestions} onChange={e => setNumQuestions(Number(e.target.value))} max={realModeMaxQuestions} className="w-full bg-black/20 p-2 rounded-lg text-white"/>
                                </div>
                                 <div>
                                    <label className="text-white block mb-1">Tiempo límite (minutos)</label>
                                    <input type="number" value={timeMinutes} onChange={e => setTimeMinutes(Number(e.target.value))} className="w-full bg-black/20 p-2 rounded-lg text-white"/>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="mt-6">
                        <button onClick={startSimulacro} className="w-full bg-secondary text-white py-3 rounded-lg font-bold hover:bg-secondary/90 transition text-lg">
                            Empezar Simulacro
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}