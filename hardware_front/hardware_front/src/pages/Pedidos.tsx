import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  getPedidos, createPedido, updatePedido, deletePedido,
  getClientes,
  type Pedido, type PedidoInput, type Cliente,
} from '../services/api.ts'

const STATUS_CORES: Record<string, string> = {
  pendente:  'bg-yellow-700 text-yellow-100',
  pago:      'bg-blue-700 text-blue-100',
  enviado:   'bg-indigo-700 text-indigo-100',
  entregue:  'bg-green-700 text-green-100',
  cancelado: 'bg-red-800 text-red-100',
}

export default function Pedidos() {
  const [pedidos, setPedidos]     = useState<Pedido[]>([])
  const [clientes, setClientes]   = useState<Cliente[]>([])
  const [editando, setEditando]   = useState<Pedido | null>(null)
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PedidoInput>()

  async function carregar() {
    try {
      const [p, c] = await Promise.all([getPedidos(), getClientes()])
      setPedidos(p); setClientes(c)
    } catch {
      toast.error('Erro ao carregar dados')
    }
  }

  useEffect(() => { carregar() }, [])

  function iniciarEdicao(p: Pedido) {
    setEditando(p)
    setValue('cliente_id',  p.cliente_id)
    setValue('valor_total', p.valor_total)
    setValue('status',      p.status as PedidoInput['status'])
  }

  function cancelar() { setEditando(null); reset() }

  async function onSubmit(data: PedidoInput) {
    const payload = { ...data, cliente_id: Number(data.cliente_id), valor_total: Number(data.valor_total) }
    try {
      if (editando) {
        await updatePedido(editando.id, payload)
        toast.success('Pedido atualizado!')
      } else {
        await createPedido(payload)
        toast.success('Pedido criado!')
      }
      cancelar(); carregar()
    } catch {
      toast.error('Erro ao salvar pedido')
    }
  }

  async function excluir(id: number) {
    if (!confirm('Excluir este pedido?')) return
    try {
      await deletePedido(id)
      toast.success('Pedido excluído!')
      carregar()
    } catch {
      toast.error('Erro ao excluir pedido')
    }
  }

  const nomeCliente = (id: number) => clientes.find(c => c.id === id)?.nome ?? '—'

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-400 mb-6">Pedidos</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 rounded-xl p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Cliente</label>
          <select {...register('cliente_id', { required: 'Obrigatório' })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500">
            <option value="">Selecione...</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          {errors.cliente_id && <p className="text-red-400 text-xs mt-1">{errors.cliente_id.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Valor Total (R$)</label>
          <input type="number" step="0.01" {...register('valor_total', { required: 'Obrigatório' })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500" placeholder="0.00" />
          {errors.valor_total && <p className="text-red-400 text-xs mt-1">{errors.valor_total.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Status</label>
          <select {...register('status')} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500">
            {['pendente','pago','enviado','entregue','cancelado'].map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3 flex gap-3">
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
              <th className="text-left px-4 py-3 text-gray-300">Data</th>
              <th className="text-left px-4 py-3 text-gray-300">Valor</th>
              <th className="text-left px-4 py-3 text-gray-300">Status</th>
              <th className="text-right px-4 py-3 text-gray-300">Ações</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map(p => (
              <tr key={p.id} className="border-t border-gray-700">
                <td className="px-4 py-3 text-gray-400">{p.id}</td>
                <td className="px-4 py-3 text-gray-100">{nomeCliente(p.cliente_id)}</td>
                <td className="px-4 py-3 text-gray-300">{new Date(p.data_pedido).toLocaleDateString('pt-BR')}</td>
                <td className="px-4 py-3 text-green-400">R$ {p.valor_total.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded font-medium ${STATUS_CORES[p.status] ?? ''}`}>{p.status}</span>
                </td>
                <td className="px-4 py-3 text-right flex justify-end gap-2">
                  <button onClick={() => iniciarEdicao(p)} className="text-xs bg-yellow-600 hover:bg-yellow-500 px-3 py-1 rounded text-white transition-colors">Editar</button>
                  <button onClick={() => excluir(p.id)} className="text-xs bg-red-700 hover:bg-red-600 px-3 py-1 rounded text-white transition-colors">Excluir</button>
                </td>
              </tr>
            ))}
            {pedidos.length === 0 && (
              <tr><td colSpan={6} className="text-center text-gray-500 py-8">Nenhum pedido cadastrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
