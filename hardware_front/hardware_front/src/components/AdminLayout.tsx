import { useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'

const links = [
  { to: '/admin/dashboard',  label: 'Visão Geral' },
  { to: '/admin/produtos',   label: 'Cadastro de Produtos' },
  { to: '/admin/categorias', label: 'Categorias' },
  { to: '/admin/clientes',   label: 'Controle de Clientes' },
  { to: '/admin/propostas',  label: 'Controle de Propostas' },
]

export default function AdminLayout() {
  const { admin, logoutAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!admin) navigate('/admin/login')
  }, [admin])

  if (!admin) return null

  function handleLogout() {
    logoutAdmin()
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <p className="text-blue-400 font-bold text-sm">⚙️ HardwareMP: Admin</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map(l => (
            <NavLink key={l.to} to={l.to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-blue-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800">
          <p className="text-gray-400 text-xs mb-2 truncate">{admin.nome}</p>
          <button onClick={handleLogout} className="w-full text-left text-sm text-red-400 hover:text-red-300 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            Sair do Sistema
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
