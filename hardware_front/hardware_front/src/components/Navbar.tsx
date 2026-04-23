import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'

export default function Navbar() {
  const { cliente, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-4">
        <span className="text-blue-400 font-bold text-lg mr-4">⚙️ HardwareMP</span>
        <NavLink to="/" end className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-blue-400' : 'text-gray-400 hover:text-gray-100'}`}>Início</NavLink>
        <NavLink to="/produtos"   className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-blue-400' : 'text-gray-400 hover:text-gray-100'}`}>Produtos</NavLink>

        <div className="ml-auto flex items-center gap-3">
          {cliente ? (
            <>
              <span className="text-sm text-gray-300 hidden sm:block">{cliente.nome}</span>
              <button onClick={() => navigate('/minhas-propostas')}  className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg transition-colors">Minhas Propostas</button>
              <button onClick={() => navigate('/minhas-avaliacoes')} className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg transition-colors">Avaliações</button>
              <button onClick={() => { logout(); navigate('/') }} className="text-sm bg-red-800 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition-colors">Sair</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-lg transition-colors">Login</button>
              <button onClick={() => navigate('/admin/login')} className="text-sm text-gray-500 hover:text-gray-400 transition-colors">Admin</button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
