import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  getProdutos, createProduto, updateProduto, deleteProduto,
  getCategorias,
  type Produto, type ProdutoInput, type Categoria,
} from '../services/api.ts'

export default function Produtos() {
  const [produtos, setProdutos]     = useState<Produto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [editando, setEditando]     = useState<Produto | null>(null)
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProdutoInput>()

  async function carregar() {
    try {
      const [p, c] = await Promise.all([getProdutos(), getCategorias()])
      setProdutos(p)
      setCategorias(c)
    } catch {
      toast.error('Erro ao carregar dados')
    }
  }

  useEffect(() => { carregar() }, [])

  function iniciarEdicao(p: Produto) {
    setEditando(p)
    setValue('categoria_id', p.categoria_id)
    setValue('nome_modelo',  p.nome_modelo)
    setValue('marca',        p.marca)
    setValue('preco',        p.preco)
    setValue('estoque',      p.estoque)
    setValue('imagens',      p.imagens)
  }

  function cancelar() { setEditando(null); reset() }

  async function onSubmit(data: ProdutoInput) {
    const payload = { ...data, categoria_id: Number(data.categoria_id), preco: Number(data.preco), estoque: Number(data.estoque) }
    try {
      if (editando) {
        await updateProduto(editando.id, payload)
        toast.success('Produto atualizado!')
      } else {
        await createProduto(payload)
        toast.success('Produto criado!')
      }
      cancelar(); carregar()
    } catch {
      toast.error('Erro ao salvar produto')
    }
  }

  async function excluir(id: number) {
    if (!confirm('Excluir este produto?')) return
    try {
      await deleteProduto(id)
      toast.success('Produto excluído!')
      carregar()
    } catch {
      toast.error('Erro ao excluir produto')
    }
  }

  const nomeCat = (id: number) => categorias.find(c => c.id === id)?.nome_categoria ?? '—'

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-400 mb-6">Produtos</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 rounded-xl p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Categoria</label>
          <select {...register('categoria_id', { required: 'Obrigatório' })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500">
            <option value="">Selecione...</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nome_categoria}</option>)}
          </select>
          {errors.categoria_id && <p className="text-red-400 text-xs mt-1">{errors.categoria_id.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Modelo</label>
          <input {...register('nome_modelo', { required: 'Obrigatório' })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500" placeholder="Ex: RTX 4070 Ti" />
          {errors.nome_modelo && <p className="text-red-400 text-xs mt-1">{errors.nome_modelo.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Marca</label>
          <input {...register('marca', { required: 'Obrigatório' })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500" placeholder="Ex: ASUS" />
          {errors.marca && <p className="text-red-400 text-xs mt-1">{errors.marca.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Preço (R$)</label>
          <input type="number" step="0.01" {...register('preco', { required: 'Obrigatório' })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500" placeholder="0.00" />
          {errors.preco && <p className="text-red-400 text-xs mt-1">{errors.preco.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Estoque</label>
          <input type="number" {...register('estoque')} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500" placeholder="0" />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Imagens (JSON de URLs)</label>
          <input {...register('imagens')} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500" placeholder='["https://..."]' />
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
              <th className="text-left px-4 py-3 text-gray-300">Modelo</th>
              <th className="text-left px-4 py-3 text-gray-300">Marca</th>
              <th className="text-left px-4 py-3 text-gray-300">Categoria</th>
              <th className="text-left px-4 py-3 text-gray-300">Preço</th>
              <th className="text-left px-4 py-3 text-gray-300">Estoque</th>
              <th className="text-right px-4 py-3 text-gray-300">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map(p => (
              <tr key={p.id} className="border-t border-gray-700">
                <td className="px-4 py-3 text-gray-400">{p.id}</td>
                <td className="px-4 py-3 text-gray-100">{p.nome_modelo}</td>
                <td className="px-4 py-3 text-gray-300">{p.marca}</td>
                <td className="px-4 py-3 text-gray-300">{nomeCat(p.categoria_id)}</td>
                <td className="px-4 py-3 text-green-400">R$ {p.preco.toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-300">{p.estoque}</td>
                <td className="px-4 py-3 text-right flex justify-end gap-2">
                  <button onClick={() => iniciarEdicao(p)} className="text-xs bg-yellow-600 hover:bg-yellow-500 px-3 py-1 rounded text-white transition-colors">Editar</button>
                  <button onClick={() => excluir(p.id)} className="text-xs bg-red-700 hover:bg-red-600 px-3 py-1 rounded text-white transition-colors">Excluir</button>
                </td>
              </tr>
            ))}
            {produtos.length === 0 && (
              <tr><td colSpan={7} className="text-center text-gray-500 py-8">Nenhum produto cadastrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
