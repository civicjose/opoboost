import { useState, useEffect } from 'react';
import {
  getTopics,
  getQuestionsByTopic,
  seedTopics,
  createQuestion,
  updateQuestion,
  deleteQuestionApi,
  deleteTopicApi,
  updateTopicTitle
} from '../api/questions';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Edit3
} from 'lucide-react';

export default function ManageTopics() {
  const [topics, setTopics]             = useState([]);
  const [expanded, setExpanded]         = useState({});
  const [questionsByTopic, setQuestions] = useState({});
  const [newQ, setNewQ]                 = useState({
    text: '',
    options: ['', '', '', ''],
    correct: 0
  });

  useEffect(() => {
    // No devuelvas nada en useEffect
    async function fetch() {
      const res = await getTopics();
      setTopics(res.data);
    }
    fetch();
  }, []);

  async function toggle(topicId) {
    setExpanded(e => ({ ...e, [topicId]: !e[topicId] }));
    if (!questionsByTopic[topicId]) {
      const res = await getQuestionsByTopic(topicId);
      setQuestions(q => ({ ...q, [topicId]: res.data }));
    }
  }

  async function onSeed() {
    if (!confirm('Sembrar 2 temas ×20 preguntas?')) return;
    await seedTopics();
    const res = await getTopics();
    setTopics(res.data);
  }

  async function onDeleteTopic(id) {
    if (!confirm(`Eliminar tema ${id}?`)) return;
    await deleteTopicApi(id);
    setTopics(topics.filter(t => t._id !== id));
  }

  async function onEditTitle(topic) {
    const title = prompt('Nuevo título:', topic.title);
    if (!title) return;
    await updateTopicTitle(topic._id, { topicTitle: title });
    setTopics(
      topics.map(t => (t._id === topic._id ? { ...t, title } : t))
    );
  }

  async function onDeleteQ(topicId, qId) {
    if (!confirm('¿Eliminar esta pregunta?')) return;
    await deleteQuestionApi(qId);
    const res = await getQuestionsByTopic(topicId);
    setQuestions(q => ({ ...q, [topicId]: res.data }));
  }

  async function onEditQ(topicId, q) {
    const text = prompt('Editar texto:', q.text);
    if (!text) return;
    await updateQuestion(q._id, { text });
    const res = await getQuestionsByTopic(topicId);
    setQuestions(q => ({ ...q, [topicId]: res.data }));
  }

  async function onAddQ(topic) {
    if (!newQ.text.trim()) {
      return alert('El texto de la pregunta es obligatorio');
    }
    await createQuestion({
      ...newQ,
      topic: topic._id,
      topicTitle: topic.title,
      validated: true
    });
    setNewQ({ text: '', options: ['', '', '', ''], correct: 0 });
    const res = await getQuestionsByTopic(topic._id);
    setQuestions(q => ({ ...q, [topic._id]: res.data }));
  }

  return (
    <div className="pt-24 max-w-4xl mx-auto space-y-6 px-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Gestión de Temas</h1>
        <button
          onClick={onSeed}
          className="flex items-center space-x-1 bg-secondary text-white px-3 py-1 rounded-md hover:bg-secondary/90 transition"
        >
          <Plus size={16} />
          <span>Sembrar Temas</span>
        </button>
      </div>

      {topics.map(topic => (
        <div
          key={topic._id}
          className="border rounded-lg overflow-hidden shadow-card"
        >
          <button
            onClick={() => toggle(topic._id)}
            className="w-full bg-white bg-opacity-80 backdrop-blur-lg flex justify-between items-center px-4 py-3"
          >
            <span className="font-medium">
              {topic._id}: {topic.title}
            </span>
            {expanded[topic._id] ? <ChevronUp /> : <ChevronDown />}
          </button>

          {expanded[topic._id] && (
            <div className="bg-white p-4 space-y-4">
              {/* Acciones de tema */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => onEditTitle(topic)}
                  className="flex items-center text-accent hover:underline"
                >
                  <Edit3 size={16} />
                  <span className="ml-1">Editar Título</span>
                </button>
                <button
                  onClick={() => onDeleteTopic(topic._id)}
                  className="flex items-center text-red-500 hover:underline"
                >
                  <Trash2 size={16} />
                  <span className="ml-1">Borrar Tema</span>
                </button>
              </div>

              {/* Listado de preguntas */}
              <ul className="space-y-2 max-h-64 overflow-auto">
                {questionsByTopic[topic._id]?.map((q, i) => (
                  <li
                    key={q._id}
                    className="p-3 border rounded-md flex justify-between items-start"
                  >
                    <div>
                      <span className="font-medium">{i + 1}.</span> {q.text}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEditQ(topic._id, q)}
                        className="text-accent hover:text-accent-dark"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteQ(topic._id, q._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Añadir nueva pregunta */}
              <div className="space-y-2">
                <textarea
                  rows={2}
                  placeholder="Texto nueva pregunta"
                  value={newQ.text}
                  onChange={e =>
                    setNewQ(n => ({ ...n, text: e.target.value }))
                  }
                  className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-secondary transition"
                />
                <div className="grid grid-cols-2 gap-2">
                  {newQ.options.map((opt, idx) => (
                    <input
                      key={idx}
                      placeholder={`Opción ${idx + 1}`}
                      value={opt}
                      onChange={e => {
                        const arr = [...newQ.options];
                        arr[idx] = e.target.value;
                        setNewQ(n => ({ ...n, options: arr }));
                      }}
                      className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-secondary transition"
                    />
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-gray-600">Correcta:</label>
                  <select
                    value={newQ.correct}
                    onChange={e =>
                      setNewQ(n => ({ ...n, correct: +e.target.value }))
                    }
                    className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-secondary transition"
                  >
                    {[0, 1, 2, 3].map(i => (
                      <option key={i} value={i}>
                        Opción {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => onAddQ(topic)}
                  className="flex items-center space-x-1 bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary/90 transition"
                >
                  <Plus size={16} />
                  <span>Añadir Pregunta</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
