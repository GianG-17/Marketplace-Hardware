import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext.tsx'
import { getAvaliacoesPorCliente, type Avaliacao } from '../services/api.ts'

function Estrelas({ nota }: { nota: number }) {
  return <span className="text-yellow-400">{'★'.repeat(nota)}{'☆'.repeat(5 - nota)}</span>
}

export default function MinhasAvaliacoes() {
  const { cliente } = useAuth()
  const navigate = useNavigate()
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!cliente) {
      navigate('/login')
      return
    }
    async function carregar() {
      try {
        const data = await getAvaliacoesPorCliente(cliente!.id)
        setAvaliacoes(data)
      } catch {
        toast.error('Erro ao carregar avaliações')
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [cliente])

  const primeiraImagem = (imagens: string): string | null => {
    if (!imagens || imagens === '[]') return null
    try {
      const arr = JSON.parse(imagens)
      return Array.isArray(arr) && arr.length > 0 ? arr[0] : null
    } catch {
      return imagens.startsWith('http') ? imagens : null
    }
  }

  if (carregando) return <div className="text-center text-gray-400 py-20">Carregando...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-400 mb-2">Minhas Avaliações</h2>
      <p className="text-gray-400 text-sm mb-6">Olá, {cliente?.nome}! Estas são suas avaliações.</p>

      {avaliacoes.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          <p className="text-5xl mb-4">⭐</p>
          <p>Você ainda não fez nenhuma avaliação.</p>
          <button onClick={() => navigate('/')} className="mt-4 text-blue-400 hover:underline">
            Ver produtos
          </button>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left px-4 py-3 text-gray-300">Produto</th>
                <th className="text-left px-4 py-3 text-gray-300">Foto</th>
                <th className="text-left px-4 py-3 text-gray-300">Nota</th>
                <th className="text-left px-4 py-3 text-gray-300">Comentário</th>
                <th className="text-left px-4 py-3 text-gray-300">Data</th>
              </tr>
            </thead>
            <tbody>
              {avaliacoes.map(a => {
                const img = primeiraImagem(a.produto?.imagens ?? '')
                return (
                  <tr key={a.id} className="border-t border-gray-700 hover:bg-gray-750">
                    <td className="px-4 py-3">
                      <p className="text-gray-100 font-medium">{a.produto?.nome_modelo ?? '—'}</p>
                      <p className="text-gray-400 text-xs">{a.produto?.marca ?? ''}</p>
                    </td>
                    <td className="px-4 py-3">
                      {img ? (
                        <img
                          src={img}
                          alt={a.produto?.nome_modelo}
                          className="w-16 h-12 object-cover rounded"
                        />
                      ) : (
                        <span className="text-2xl">🖥️</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Estrelas nota={a.nota} />
                    </td>
                    <td className="px-4 py-3 text-gray-400 max-w-xs">
                      {a.comentario ?? <span className="text-gray-600 italic">sem comentário</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {a.criado_em ? new Date(a.criado_em).toLocaleDateString('pt-BR') : '—'}
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
