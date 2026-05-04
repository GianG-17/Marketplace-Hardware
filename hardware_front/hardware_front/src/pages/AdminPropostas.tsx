import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { getPropostas, responderProposta, deleteProposta, type Proposta } from '../services/api.ts'

const STATUS_COR: Record<string, string> = {
  aguardando: 'bg-yellow-800 text-yellow-200',
  aceita:     'bg-green-800 text-green-200',
  recusada:   'bg-red-800 text-red-200',
}

type RespostaForm = { resposta: string; status: 'aceita' | 'recusada' }

export default function AdminPropostas() {
  const [propostas, setPropostas]     = useState<Proposta[]>([])
  const [respondendo, setRespondendo] = useState<Proposta | null>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RespostaForm>()

  async function carregar() {
    try { setPropostas(await getPropostas()) }
    catch { toast.error('Erro ao carregar propostas') }
  }

  useEffect(() => { carregar() }, [])

  async function onResponder(data: RespostaForm) {
    if (!respondendo) return
    try {
      await responderProposta(respondendo.id, data)
      toast.success('Resposta enviada!')
      setRespondendo(null); reset(); carregar()
    } catch { toast.error('Erro ao responder') }
  }

  async function excluir(id: number) {
    if (!confirm('Excluir esta proposta?')) return
    try {
      await deleteProposta(id)
      toast.success('Proposta excluída!')
      carregar()
    } catch { toast.error('Erro ao excluir') }
  }

  const primeiraImagem = (imagens: string) => {
    try { const a = JSON.parse(imagens); return Array.isArray(a) && a.length > 0 ? a[0] : null }
    catch { return imagens.startsWith('http') ? imagens : null }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-100 mb-6">Controle de Propostas</h2>

      {respondendo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-100 mb-1">Responder Proposta</h3>
            <p className="text-gray-400 text-sm mb-1">Produto: <span className="text-gray-200">{respondendo.produto?.nome_modelo}</span></p>
            <p className="text-gray-400 text-sm mb-4">Cliente: <span className="text-gray-200">{respondendo.cliente?.nome}</span></p>
            <div className="bg-gray-900 rounded-lg p-3 mb-4">
              <p className="text-gray-300 text-sm">{respondendo.mensagem}</p>
            </div>
            <form onSubmit={handleSubmit(onResponder)} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Sua resposta</label>
                <textarea {...register('resposta')} rows={3}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Ex: Produto disponível! Pode retirar na loja..." />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Decisão</label>
                <select {...register('status')} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500">
                  <option value="aceita">Aceitar proposta</option>
                  <option value="recusada">Recusar proposta</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors">Enviar</button>
                <button type="button" onClick={() => { setRespondendo(null); reset() }} className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-700">
            <tr>
              <th className="text-left px-4 py-3 text-gray-300">Foto</th>
              <th className="text-left px-4 py-3 text-gray-300">Produto</th>
              <th className="text-left px-4 py-3 text-gray-300">Preço</th>
              <th className="text-left px-4 py-3 text-gray-300">Cliente</th>
              <th className="text-left px-4 py-3 text-gray-300">Proposta</th>
              <th className="text-left px-4 py-3 text-gray-300">Resposta</th>
              <th className="text-left px-4 py-3 text-gray-300">Status</th>
              <th className="text-right px-4 py-3 text-gray-300">Ações</th>
            </tr>
          </thead>
          <tbody>
            {propostas.map(p => {
              const img = primeiraImagem(p.produto?.imagens ?? '')
              return (
                <tr key={p.id} className="border-t border-gray-700">
                  <td className="px-4 py-3">
                    {img
                      ? <img src={img} className="w-14 h-10 object-cover rounded" alt="" />
                      : <span className="text-xs text-gray-500">Sem imagem</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-gray-100">{p.produto?.nome_modelo}<br /><span className="text-gray-500 text-xs">{p.produto?.marca}</span></td>
                  <td className="px-4 py-3 text-green-400">R$ {p.produto?.preco?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-300">{p.cliente?.nome}<br /><span className="text-gray-500 text-xs">{p.cliente?.email}</span></td>
                  <td className="px-4 py-3 text-gray-400 max-w-xs">
                    <p className="line-clamp-2">{p.mensagem}</p>
                    {p.criado_em && <p className="text-gray-600 text-xs mt-1">{new Date(p.criado_em).toLocaleDateString('pt-BR')}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-400 max-w-xs">
                    {p.resposta ? <p className="line-clamp-2 text-blue-300">{p.resposta}</p> : <span className="text-gray-600 italic">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${STATUS_COR[p.status] ?? ''}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {p.status === 'aguardando' && (
                        <button onClick={() => setRespondendo(p)} className="text-xs bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded text-white transition-colors">Responder</button>
                      )}
                      <button onClick={() => excluir(p.id)} className="text-xs bg-red-700 hover:bg-red-600 px-3 py-1 rounded text-white transition-colors">Excluir</button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {propostas.length === 0 && (
              <tr><td colSpan={8} className="text-center text-gray-500 py-8">Nenhuma proposta ainda</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
