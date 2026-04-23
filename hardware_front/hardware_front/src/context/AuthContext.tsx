import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type ClienteLogado = { id: number; nome: string; email: string }
type AdminLogado   = { id: number; nome: string; email: string; nivel_acesso: string }

type AuthContextType = {
  cliente:  ClienteLogado | null
  admin:    AdminLogado   | null
  loginCliente: (c: ClienteLogado, manter: boolean) => void
  loginAdmin:   (a: AdminLogado) => void
  logout:   () => void
  logoutAdmin: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [cliente, setCliente] = useState<ClienteLogado | null>(null)
  const [admin,   setAdmin]   = useState<AdminLogado   | null>(null)

  useEffect(() => {
    const c = localStorage.getItem('clienteKey')
    const a = sessionStorage.getItem('adminKey')
    if (c) { try { setCliente(JSON.parse(c)) } catch { localStorage.removeItem('clienteKey') } }
    if (a) { try { setAdmin(JSON.parse(a))   } catch { sessionStorage.removeItem('adminKey') } }
  }, [])

  function loginCliente(c: ClienteLogado, manter: boolean) {
    setCliente(c)
    if (manter) localStorage.setItem('clienteKey', JSON.stringify(c))
  }

  function loginAdmin(a: AdminLogado) {
    setAdmin(a)
    sessionStorage.setItem('adminKey', JSON.stringify(a))
  }

  function logout() {
    setCliente(null)
    localStorage.removeItem('clienteKey')
  }

  function logoutAdmin() {
    setAdmin(null)
    sessionStorage.removeItem('adminKey')
  }

  return (
    <AuthContext.Provider value={{ cliente, admin, loginCliente, loginAdmin, logout, logoutAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
