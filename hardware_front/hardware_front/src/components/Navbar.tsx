import { NavLink } from 'react-router-dom'

const links = [
  { to: '/',           label: 'Início' },
  { to: '/produtos',   label: 'Produtos' },
  { to: '/categorias', label: 'Categorias' },
]

export default function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-4">
        <span className="text-blue-400 font-bold text-lg mr-4">HardwareMP</span>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive ? 'text-blue-400' : 'text-gray-400 hover:text-gray-100'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}