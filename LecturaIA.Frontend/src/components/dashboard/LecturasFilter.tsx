
interface LecturasFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterTipo: string;
  setFilterTipo: (tipo: string) => void;
  filterNivel: string;
  setFilterNivel: (nivel: string) => void;
  onGenerarLectura: () => void;
}

export default function LecturasFilter({
  searchTerm,
  setSearchTerm,
  filterTipo,
  setFilterTipo,
  filterNivel,
  setFilterNivel,
  onGenerarLectura
}: LecturasFilterProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Buscador */}
        <div className="flex-1">
          <div className="relative">
            <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar lecturas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filtro por tipo */}
        <div>
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos los tipos</option>
            <option value="Narrativa">Narrativa</option>
            <option value="Descriptiva">Descriptiva</option>
            <option value="Argumentativa">Argumentativa</option>
            <option value="Expositiva">Expositiva</option>
            <option value="Informativa">Informativa</option>
          </select>
        </div>

        {/* Filtro por longitud */}
        <div>
          <select
            value={filterNivel}
            onChange={(e) => setFilterNivel(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todas las longitudes</option>
            <option value="Corta">Corta</option>
            <option value="Mediana">Mediana</option>
            <option value="Larga">Larga</option>
          </select>
        </div>

        {/* Botón Generar Nueva Lectura */}
        <div>
          <button
            onClick={onGenerarLectura}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Generar Nueva Lectura</span>
          </button>
        </div>
      </div>
    </div>
  );
}
