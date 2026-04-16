import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.tsx'
import Home from './pages/Home.tsx'
import Produtos from './pages/Produtos.tsx'
import Categorias from './pages/Categorias.tsx'
import Clientes from './pages/Clientes.tsx'
import Pedidos from './pages/Pedidos.tsx'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/"           element={<Home />} />
          <Route path="/produtos"   element={<Produtos />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/clientes"   element={<Clientes />} />
          <Route path="/pedidos"    element={<Pedidos />} />
        </Routes>
      </main>
    </div>
  )
}
