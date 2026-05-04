import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.tsx'
import Navbar from './components/Navbar.tsx'
import AdminLayout from './components/AdminLayout.tsx'

import Home             from './pages/Home.tsx'
import Produtos         from './pages/Produtos.tsx'
import ProdutoDetalhe   from './pages/ProdutoDetalhe.tsx'
import Categorias       from './pages/Categorias.tsx'
import Clientes         from './pages/Clientes.tsx'
import Admins           from './pages/Admins.tsx'
import Pedidos          from './pages/Pedidos.tsx'
import Avaliacoes       from './pages/Avaliacoes.tsx'
import Login            from './pages/Login.tsx'
import MinhasAvaliacoes from './pages/MinhasAvaliacoes.tsx'
import MinhasPropostas  from './pages/MinhasPropostas.tsx'
import LoginAdmin       from './pages/LoginAdmin.tsx'
import AdminDashboard   from './pages/AdminDashboard.tsx'
import AdminPropostas   from './pages/AdminPropostas.tsx'

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/"                  element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/produtos"          element={<PublicLayout><Produtos /></PublicLayout>} />
        <Route path="/produto/:id"       element={<PublicLayout><ProdutoDetalhe /></PublicLayout>} />
        <Route path="/clientes"          element={<PublicLayout><Clientes /></PublicLayout>} />
        <Route path="/admins"            element={<PublicLayout><Admins /></PublicLayout>} />
        <Route path="/pedidos"           element={<PublicLayout><Pedidos /></PublicLayout>} />
        <Route path="/avaliacoes"        element={<PublicLayout><Avaliacoes /></PublicLayout>} />
        <Route path="/login"             element={<PublicLayout><Login /></PublicLayout>} />
        <Route path="/minhas-avaliacoes" element={<PublicLayout><MinhasAvaliacoes /></PublicLayout>} />
        <Route path="/minhas-propostas"  element={<PublicLayout><MinhasPropostas /></PublicLayout>} />

        <Route path="/admin/login"  element={<div className="min-h-screen bg-gray-950 text-gray-100"><LoginAdmin /></div>} />
        <Route path="/admin"        element={<AdminLayout />}>
          <Route path="dashboard"   element={<AdminDashboard />} />
          <Route path="produtos"    element={<Produtos />} />
          <Route path="categorias"  element={<Categorias />} />
          <Route path="clientes"    element={<Clientes />} />
          <Route path="propostas"   element={<AdminPropostas />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
