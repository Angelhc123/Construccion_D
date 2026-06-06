import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">LecturaIA</h1>
          <p className="text-xl text-blue-100">Sistema Educativo de Comprensión Lectora</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Acceso para Estudiantes */}
          <div className="bg-white rounded-lg shadow-xl p-8 transform transition hover:scale-105">
            <div className="text-center mb-6">
              <div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden bg-blue-50">
                <img 
                  src="/estudiante.png" 
                  alt="Estudiante" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback al icono SVG si la imagen no existe
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `
                      <svg class="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    `;
                  }}
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Estudiantes</h2>
              <p className="text-gray-600 mb-6">Accede a tus actividades de comprensión lectora</p>
            </div>
            <button
              onClick={() => navigate('/estudiante')}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Acceso para Estudiantes
            </button>
          </div>

          {/* Acceso para Docentes */}
          <div className="bg-white rounded-lg shadow-xl p-8 transform transition hover:scale-105">
            <div className="text-center mb-6">
              <div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden bg-green-50">
                <img 
                  src="/docente.png" 
                  alt="Docente" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback al icono SVG si la imagen no existe
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `
                      <svg class="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    `;
                  }}
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Docentes</h2>
              <p className="text-gray-600 mb-6">Gestiona tus estudiantes y actividades</p>
            </div>
            <button
              onClick={() => navigate('/docente')}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Acceso para Docentes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
