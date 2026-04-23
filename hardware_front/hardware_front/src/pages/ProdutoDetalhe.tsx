import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext.tsx'
import {
  getProduto, getAvaliacoesPorProduto, createAvaliacao,
  getPropostasPorProduto, createProposta, responderProposta,
  type Produto, type Avaliacao, type AvaliacaoInput, type Proposta,
} from '../services/api.ts'

type AvaliacaoForm = { nota: number; comentario: string }
type PropostaForm  = { mensagem: string }
type RespostaForm  = { resposta: string; status: 'aceita' | 'recusada' }

function Estrelas({ nota }: { nota: number }) {
  return <span className="text-yellow-400">{'★'.repeat(nota)}{'☆'.repeat(5 - nota)}</span>
}

const STATUS_COR: Record<string, string> = {
  aguardando: 'bg-yellow-800 text-yellow-200',
  aceita:     'bg-green-800 text-green-200',
  recusada:   'bg-red-800 text-red-200',
}

export default function ProdutoDetalhe() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { cliente } = useAuth()

  const [produto,       setProduto]       = useState<Produto | null>(null)
  const [avaliacoes,    setAvaliacoes]    = useState<Avaliacao[]>([])
  const [propostas,     setPropostas]     = useState<Proposta[]>([])
  const [carregando,    setCarregando]    = useState(true)
  const [aba,           setAba]           = useState<'proposta' | 'avaliar'>('proposta')
  const [respondendo,   setRespondendo]   = useState<Proposta | null>(null)

  const avalForm     = useForm<AvaliacaoForm>()
  const propostaForm = useForm<PropostaForm>()
  const respostaForm = useForm<RespostaForm>({ defaultValues: { status: 'aceita' } })

  async function carregar() {
    try {
      const [p, a, pr] = await Promise.all([
        getProduto(Number(id)),
        getAvaliacoesPorProduto(Number(id)),
        getPropostasPorProduto(Number(id)),
      ])
      setProduto(p); setAvaliacoes(a); setPropostas(pr)
    } catch {
      toast.error('Produto não encontrado')
      navigate('/')
    } finally { setCarregando(false) }
  }

  useEffect(() => { carregar() }, [id])

  async function onAvaliar(data: AvaliacaoForm) {
    if (!cliente) return
    try {
      await createAvaliacao({ cliente_id: cliente.id, produto_id: Number(id), nota: Number(data.nota), comentario: data.comentario } as AvaliacaoInput)
      toast.success('Avaliação enviada!')
      avalForm.reset(); carregar()
    } catch { toast.error('Você já avaliou este produto.') }
  }

  async function onProposta(data: PropostaForm) {
    if (!cliente) return
    try {
      await createProposta({ cliente_id: cliente.id, produto_id: Number(id), mensagem: data.mensagem })
      toast.success('Proposta enviada! Aguarde retorno.')
      propostaForm.reset(); carregar()
    } catch { toast.error('Erro ao enviar proposta.') }
  }

  async function onResponder(data: RespostaForm) {
    if (!respondendo) return
    try {
      await responderProposta(respondendo.id, data)
      toast.success('Resposta enviada!')
      setRespondendo(null); respostaForm.reset(); carregar()
    } catch { toast.error('Erro ao responder.') }
  }

  const primeiraImagem = (imagens: string): string | null => {
    if (!imagens || imagens === '[]') return null
    try { const arr = JSON.parse(imagens); return Array.isArray(arr) && arr.length > 0 ? arr[0] : null }
    catch { return imagens.startsWith('http') ? imagens : null }
  }

  const mediaNotas   = avaliacoes.length ? (avaliacoes.reduce((s, a) => s + a.nota, 0) / avaliacoes.length).toFixed(1) : null
  const jaFezProposta = propostas.some(p => p.cliente_id === cliente?.id)
  const ehDono        = produto?.cliente_id != null && produto.cliente_id === cliente?.id

  if (carregando) return <div className="text-center text-gray-400 py-20">Carregando...</div>
  if (!produto)   return null

  const img = primeiraImagem(produto.imagens)

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-blue-400 hover:underline text-sm mb-6 inline-block">← Voltar</button>

      {/* Card do produto */}
      <div className="bg-gray-800 rounded-xl overflow-hidden mb-8 flex flex-col md:flex-row">
        <div className="md:w-1/2 bg-gray-700 h-64 md:h-auto flex items-center justify-center">
          {img ? <img src={img} alt={produto.nome_modelo} className="w-full h-full object-cover" /> : <span className="text-7xl">🖥️</span>}
        </div>
        <div className="md:w-1/2 p-6 flex flex-col justify-center">
          <span className="text-xs text-blue-400 uppercase tracking-wide mb-1">{produto.categoria?.nome_categoria ?? ''}</span>
          <h1 className="text-2xl font-bold text-gray-100 mb-1">{produto.nome_modelo}</h1>
          <p className="text-gray-400 mb-1">{produto.marca}</p>
          {produto.descricao && <p className="text-gray-400 text-sm mb-3 leading-relaxed">{produto.descricao}</p>}
          <p className="text-3xl font-bold text-green-400 mb-2">R$ {produto.preco.toFixed(2)}</p>
          {mediaNotas && <p className="text-sm text-yellow-400 mb-2">⭐ {mediaNotas} / 5 — {avaliacoes.length} avaliação(ões)</p>}
          {produto.vendido
            ? <span className="inline-block text-xs px-3 py-1 rounded bg-gray-700 text-gray-400 w-fit">Produto vendido</span>
            : <span className="inline-block text-xs px-3 py-1 rounded bg-green-900 text-green-300 w-fit">{produto.estoque} em estoque</span>
          }
          {produto.cliente && <p className="text-gray-500 text-xs mt-2">Vendedor: {produto.cliente.nome}</p>}
          {!cliente && (
            <p className="mt-4 text-sm text-gray-400">
              🔒 <button onClick={() => navigate('/login')} className="text-blue-400 hover:underline">Identifique-se</button> para interagir.
            </p>
          )}
        </div>
      </div>

      {/* ── ÁREA DO DONO: propostas recebidas ── */}
      {ehDono && (
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">
            📬 Propostas recebidas ({propostas.length})
          </h3>

          {/* Modal de resposta */}
          {respondendo && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
                <h4 className="text-lg font-semibold text-gray-100 mb-2">Responder Proposta</h4>
                <p className="text-gray-400 text-sm mb-1">De: <span className="text-gray-200">{respondendo.cliente?.nome} ({respondendo.cliente?.email})</span></p>
                <div className="bg-gray-900 rounded-lg p-3 mb-4">
                  <p className="text-gray-300 text-sm">{respondendo.mensagem}</p>
                </div>
                <form onSubmit={respostaForm.handleSubmit(onResponder)} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Sua resposta</label>
                    <textarea {...respostaForm.register('resposta', { required: 'Obrigatório' })} rows={3}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500 resize-none"
                      placeholder="Ex: Produto disponível, pode entrar em contato!" />
                    {respostaForm.formState.errors.resposta && <p className="text-red-400 text-xs mt-1">{respostaForm.formState.errors.resposta.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Decisão</label>
                    <select {...respostaForm.register('status')} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500">
                      <option value="aceita">✅ Aceitar proposta</option>
                      <option value="recusada">❌ Recusar proposta</option>
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors">Enviar</button>
                    <button type="button" onClick={() => { setRespondendo(null); respostaForm.reset() }} className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors">Cancelar</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {propostas.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhuma proposta recebida ainda.</p>
          ) : (
            <div className="space-y-3">
              {propostas.map(pr => (
                <div key={pr.id} className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-200 text-sm">{pr.cliente?.nome}</span>
                        <span className="text-gray-500 text-xs">{pr.cliente?.email}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COR[pr.status] ?? ''}`}>{pr.status}</span>
                      </div>
                      <p className="text-gray-400 text-sm">{pr.mensagem}</p>
                      {pr.resposta && (
                        <p className="text-blue-300 text-sm mt-2 border-l-2 border-blue-600 pl-2">
                          Sua resposta: {pr.resposta}
                        </p>
                      )}
                    </div>
                    {pr.status === 'aguardando' && (
                      <button onClick={() => setRespondendo(pr)}
                        className="text-xs bg-blue-700 hover:bg-blue-600 px-3 py-1.5 rounded text-white transition-colors whitespace-nowrap">
                        Responder
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ÁREA DO COMPRADOR: proposta + avaliação ── */}
      {cliente && !produto.vendido && !ehDono && (
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <div className="flex gap-3 mb-5">
            <button onClick={() => setAba('proposta')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${aba === 'proposta' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>💬 Fazer Proposta</button>
            <button onClick={() => setAba('avaliar')}  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${aba === 'avaliar'  ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>⭐ Avaliar</button>
          </div>

          {aba === 'proposta' && (
            jaFezProposta ? (
              <p className="text-yellow-400 text-sm">✅ Você já enviou uma proposta. Acompanhe em <button onClick={() => navigate('/minhas-propostas')} className="underline">Minhas Propostas</button>.</p>
            ) : (
              <form onSubmit={propostaForm.handleSubmit(onProposta)} className="space-y-4">
                <p className="text-sm text-gray-400">😊 Você pode fazer uma proposta para este produto!</p>
                <p className="text-sm text-gray-500">{cliente.nome} ({cliente.email})</p>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Sua proposta</label>
                  <textarea {...propostaForm.register('mensagem', { required: 'Escreva sua proposta' })} rows={3}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Ex: Aceito R$ 900 à vista, posso retirar pessoalmente..." />
                  {propostaForm.formState.errors.mensagem && <p className="text-red-400 text-xs mt-1">{propostaForm.formState.errors.mensagem.message}</p>}
                </div>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">Enviar Proposta</button>
              </form>
            )
          )}

          {aba === 'avaliar' && (
            <form onSubmit={avalForm.handleSubmit(onAvaliar)} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nota (1 a 5)</label>
                <select {...avalForm.register('nota', { required: 'Selecione uma nota' })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500">
                  <option value="">Selecione...</option>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>)}
                </select>
                {avalForm.formState.errors.nota && <p className="text-red-400 text-xs mt-1">{avalForm.formState.errors.nota.message}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Comentário</label>
                <textarea {...avalForm.register('comentario')} rows={3}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Descreva sua experiência..." />
              </div>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">Enviar Avaliação</button>
            </form>
          )}
        </div>
      )}

      {/* Avaliações */}
      <div>
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Avaliações ({avaliacoes.length})</h3>
        {avaliacoes.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhuma avaliação ainda.</p>
        ) : (
          <div className="space-y-4">
            {avaliacoes.map(a => (
              <div key={a.id} className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-200">{a.cliente?.nome ?? 'Cliente'}</span>
                  <Estrelas nota={a.nota} />
                </div>
                {a.comentario && <p className="text-gray-400 text-sm">{a.comentario}</p>}
                {a.criado_em && <p className="text-gray-600 text-xs mt-2">{new Date(a.criado_em).toLocaleDateString('pt-BR')}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
