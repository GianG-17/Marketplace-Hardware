import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  getAvaliacoes, createAvaliacao, updateAvaliacao, deleteAvaliacao,
  getClientes, getProdutos,
  type Avaliacao, type AvaliacaoInput, type Cliente, type Produto,
} from '../services/api.ts'

function Estrelas({ nota }: { nota: number }) {
  return (
    <span className="text-yellow-400 text-sm">
      {'★'.repeat(nota)}{'☆'.repeat(5 - nota)}
    </span>
  )
}

export default function Avaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [clientes, setClientes]     = useState<Cliente[]>([])
  const [produtos, setProdutos]     = useState<Produto[]>([])
  const [editando, setEditando]     = useState<Avaliacao | null>(null)
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AvaliacaoInput>()

  async function carregar() {
    try {
      const [a, c, p] = await Promise.all([getAvaliacoes(), getClientes(), getProdutos()])
      setAvaliacoes(a); setClientes(c); setProdutos(p)
    } catch {
      toast.error('Erro ao carregar dados')
    }
  }

  useEffect(() => { carregar() }, [])

  function iniciarEdicao(a: Avaliacao) {
    setEditando(a)
    setValue('cliente_id', a.cliente_id)
    setValue('produto_id', a.produto_id)
    setValue('nota',       a.nota)
    setValue('comentario', a.comentario ?? '')
  }

  function cancelar() { setEditando(null); reset() }

  async function onSubmit(data: AvaliacaoInput) {
    const payload = {
      ...data,
      cliente_id: Number(data.cliente_id),
      produto_id: Number(data.produto_id),
      nota:       Number(data.nota),
    }
    try {
      if (editando) {
        await updateAvaliacao(editando.id, payload)
        toast.success('Avaliação atualizada!')
      } else {
        await createAvaliacao(payload)
        toast.success('Avaliação criada!')
      }
      cancelar(); carregar()
    } catch {
      toast.error('Erro ao salvar avaliação')
    }
  }

  async function excluir(id: number) {
    if (!confirm('Excluir esta avaliação?')) return
    try {
      await deleteAvaliacao(id)
      toast.success('Avaliação excluída!')
      carregar()
    } catch {
      toast.error('Erro ao excluir avaliação')
    }
  }

  const nomeCliente = (id: number) => clientes.find(c => c.id === id)?.nome ?? '—'
  const nomeProduto = (id: number) => produtos.find(p => p.id === id)?.nome_modelo ?? '—'

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-400 mb-6">Avaliações</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 rounded-xl p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Cliente</label>
          <select {...register('cliente_id', { required: 'Obrigatório' })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500">
            <option value="">Selecione...</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          {errors.cliente_id && <p className="text-red-400 text-xs mt-1">{errors.cliente_id.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Produto</label>
          <select {...register('produto_id', { required: 'Obrigatório' })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500">
            <option value="">Selecione...</option>
            {produtos.map(p => <option key={p.id} value={p.id}>{p.nome_modelo} — {p.marca}</option>)}
          </select>
          {errors.produto_id && <p className="text-red-400 text-xs mt-1">{errors.produto_id.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Nota (1–5)</label>
          <select {...register('nota', { required: 'Obrigatório' })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500">
            <option value="">Selecione...</option>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>)}
          </select>
          {errors.nota && <p className="text-red-400 text-xs mt-1">{errors.nota.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Comentário (opcional)</label>
          <input {...register('comentario')} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500" placeholder="Ótimo produto, entrega rápida..." />
        </div>

        <div className="md:col-span-2 flex gap-3">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            {editando ? 'Atualizar' : 'Adicionar'}
          </button>
          {editando && (
            <button type="button" onClick={cancelar} className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors">Cancelar</button>
          )}
        </div>
      </form>

      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-700">
            <tr>
              <th className="text-left px-4 py-3 text-gray-300">#</th>
              <th className="text-left px-4 py-3 text-gray-300">Cliente</th>
              <th className="text-left px-4 py-3 text-gray-300">Produto</th>
              <th className="text-left px-4 py-3 text-gray-300">Nota</th>
              <th className="text-left px-4 py-3 text-gray-300">Comentário</th>
              <th className="text-right px-4 py-3 text-gray-300">Ações</th>
            </tr>
          </thead>
          <tbody>
            {avaliacoes.map(a => (
              <tr key={a.id} className="border-t border-gray-700">
                <td className="px-4 py-3 text-gray-400">{a.id}</td>
                <td className="px-4 py-3 text-gray-100">{nomeCliente(a.cliente_id)}</td>
                <td className="px-4 py-3 text-gray-300">{nomeProduto(a.produto_id)}</td>
                <td className="px-4 py-3"><Estrelas nota={a.nota} /></td>
                <td className="px-4 py-3 text-gray-400 max-w-xs truncate">{a.comentario ?? '—'}</td>
                <td className="px-4 py-3 text-right flex justify-end gap-2">
                  <button onClick={() => iniciarEdicao(a)} className="text-xs bg-yellow-600 hover:bg-yellow-500 px-3 py-1 rounded text-white transition-colors">Editar</button>
                  <button onClick={() => excluir(a.id)} className="text-xs bg-red-700 hover:bg-red-600 px-3 py-1 rounded text-white transition-colors">Excluir</button>
                </td>
              </tr>
            ))}
            {avaliacoes.length === 0 && (
              <tr><td colSpan={6} className="text-center text-gray-500 py-8">Nenhuma avaliação cadastrada</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
