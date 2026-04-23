import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext.tsx'
import { getPropostasPorCliente, type Proposta } from '../services/api.ts'

const STATUS_COR: Record<string, string> = {
  aguardando: 'bg-yellow-800 text-yellow-200',
  aceita:     'bg-green-800 text-green-200',
  recusada:   'bg-red-800 text-red-200',
}

export default function MinhasPropostas() {
  const { cliente } = useAuth()
  const navigate    = useNavigate()
  const [propostas, setPropostas]   = useState<Proposta[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!cliente) { navigate('/login'); return }
    getPropostasPorCliente(cliente.id)
      .then(setPropostas)
      .catch(() => toast.error('Erro ao carregar propostas'))
      .finally(() => setCarregando(false))
  }, [cliente])

  const primeiraImagem = (imagens: string) => {
    try { const a = JSON.parse(imagens); return Array.isArray(a) && a.length > 0 ? a[0] : null }
    catch { return imagens.startsWith('http') ? imagens : null }
  }

  if (carregando) return <div className="text-center text-gray-400 py-20">Carregando...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-400 mb-2">Minhas Propostas</h2>
      <p className="text-gray-400 text-sm mb-6">Olá, {cliente?.nome}! Acompanhe suas propostas enviadas.</p>

      {propostas.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          <p className="text-5xl mb-4">💬</p>
          <p>Você ainda não fez nenhuma proposta.</p>
          <button onClick={() => navigate('/')} className="mt-4 text-blue-400 hover:underline">Ver produtos</button>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left px-4 py-3 text-gray-300">Produto</th>
                <th className="text-left px-4 py-3 text-gray-300">Foto</th>
                <th className="text-left px-4 py-3 text-gray-300">Proposta</th>
                <th className="text-left px-4 py-3 text-gray-300">Resposta</th>
                <th className="text-left px-4 py-3 text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {propostas.map(p => {
                const img = primeiraImagem(p.produto?.imagens ?? '')
                return (
                  <tr key={p.id} className="border-t border-gray-700">
                    <td className="px-4 py-3">
                      <p className="text-gray-100 font-medium">{p.produto?.nome_modelo ?? '—'}</p>
                      <p className="text-gray-400 text-xs">{p.produto?.marca}</p>
                    </td>
                    <td className="px-4 py-3">
                      {img
                        ? <img src={img} className="w-16 h-12 object-cover rounded" alt="" />
                        : <span className="text-2xl">🖥️</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-gray-400 max-w-xs">
                      <p>{p.mensagem}</p>
                      {p.criado_em && <p className="text-gray-600 text-xs mt-1">{new Date(p.criado_em).toLocaleDateString('pt-BR')}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {p.resposta
                        ? <p className="text-blue-300 text-sm">{p.resposta}</p>
                        : <span className="text-gray-500 italic text-sm">Aguardando...</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${STATUS_COR[p.status] ?? ''}`}>{p.status}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
