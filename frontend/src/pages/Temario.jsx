import { useEffect, useState } from 'react';
import { getTopics, getQuestionsByTopic } from '../api/questions';

export default function Temario() {
  const [topics, setTopics] = useState([]);
  const [questionsByTopic, setQuestionsByTopic] = useState({});

  useEffect(() => {
    getTopics().then(res => setTopics(res.data));
  }, []);

  const loadTopic = (topic) => {
    if (questionsByTopic[topic]) return;
    getQuestionsByTopic(topic).then(res => {
      setQuestionsByTopic(q => ({ ...q, [topic]: res.data }));
    });
  };

  return (
    <div className="p-6 space-y-8">
      {topics.map(t => (
        <section key={t._id}>
          <h2
            className="text-2xl font-bold cursor-pointer"
            onClick={() => loadTopic(t._id)}
          >
            {t._id}: {t.title}
          </h2>
          {questionsByTopic[t._id] && (
            <ul className="mt-4 space-y-2">
              {questionsByTopic[t._id].map(q => (
                <li key={q._id} className="border-l-4 border-indigo-500 pl-4">
                  {q.text}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
