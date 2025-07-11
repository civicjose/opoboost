// frontend/src/pages/UploadPDF.jsx
import { useState } from 'react';
import api from '../api/auth';
import { UploadCloud } from 'lucide-react';

export default function UploadPDF() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);  // preguntas parseadas
  const [loading, setLoading] = useState(false);

  // Paso 1: parsear
  const handleParse = async () => {
    if (!file) return alert('Selecciona un PDF');
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await api.post('/pdfs/parse', fd);
      setPreview(res.data.preguntas);
    } catch {
      alert('Error parseando PDF');
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: importar
  const handleImport = async () => {
    if (!preview.length) return;
    setLoading(true);
    try {
      const res = await api.post('/pdfs/import', { preguntas: preview });
      alert(res.data.message);
      setPreview([]);
      setFile(null);
    } catch {
      alert('Error importando');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 flex-1 flex flex-col items-center bg-gradient-to-tr from-primary to-secondary">
      <div className="w-full max-w-lg bg-white bg-opacity-90 backdrop-blur-lg p-6 rounded-2xl shadow-xl space-y-6">
        <div className="flex items-center space-x-3">
          <UploadCloud size={28} className="text-secondary" />
          <h1 className="text-2xl font-semibold text-gray-800">Importar preguntas desde PDF</h1>
        </div>

        {/* Selección de archivo */}
        <label className="block">
          <span className="text-gray-600">Selecciona el PDF</span>
          <input
            type="file"
            accept="application/pdf"
            onChange={e => setFile(e.target.files[0])}
            className="mt-2"
          />
        </label>

        <button
          onClick={handleParse}
          disabled={loading}
          className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition"
        >
          {loading ? 'Parseando…' : 'Mostrar vista previa'}
        </button>

        {preview.length > 0 && (
          <>
            <h2 className="text-lg font-medium text-gray-700">Vista previa ({preview.length}):</h2>
            <div className="max-h-64 overflow-auto space-y-4">
              {preview.map((q,i) => (
                <div key={i} className="p-3 border rounded-lg bg-gray-50">
                  <p className="font-medium">{i+1}. {q.text}</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                    {q.options.map((o,j)=><li key={j}>{o.text}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <button
              onClick={handleImport}
              disabled={loading}
              className="w-full bg-secondary text-white py-2 rounded-md hover:bg-secondary/90 transition mt-4"
            >
              {loading ? 'Importando…' : 'Confirmar importación'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
