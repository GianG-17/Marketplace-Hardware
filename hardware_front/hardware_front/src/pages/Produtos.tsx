import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext.tsx'
import {
  getProdutos, getProdutosPorCliente, createProduto, updateProduto, deleteProduto, marcarVendido,
  getCategorias, createCategoria,
  type Produto, type ProdutoInput, type Categoria,
} from '../services/api.ts'

export default function Produtos() {
  const { cliente, admin } = useAuth()
  const [produtos, setProdutos]         = useState<Produto[]>([])
  const [categorias, setCategorias]     = useState<Categoria[]>([])
  const [editando, setEditando]         = useState<Produto | null>(null)
  const [aba, setAba]                   = useState<'todos' | 'meus'>('todos')
  const [novaCategoria, setNovaCategoria] = useState('')
  const [mostrarNovaCat, setMostrarNovaCat] = useState(false)
  const [salvandoCat, setSalvandoCat]   = useState(false)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProdutoInput>()

  async function carregar() {
    try {
      const [p, c] = await Promise.all([getProdutos(), getCategorias()])
      setProdutos(p); setCategorias(c)
    } catch { toast.error('Erro ao carregar dados') }
  }

  async function carregarMeus() {
    if (!cliente) return
    try {
      const [p, c] = await Promise.all([getProdutosPorCliente(cliente.id), getCategorias()])
      setProdutos(p); setCategorias(c)
    } catch { toast.error('Erro ao carregar dados') }
  }

  useEffect(() => { aba === 'todos' ? carregar() : carregarMeus() }, [aba])

  async function adicionarCategoria() {
    if (!novaCategoria.trim()) { toast.error('Digite um nome para a categoria'); return }
    setSalvandoCat(true)
    try {
      const nova = await createCategoria({ nome_categoria: novaCategoria.trim() })
      setCategorias(prev => [...prev, nova])
      setValue('categoria_id', nova.id)
      setNovaCategoria('')
      setMostrarNovaCat(false)
      toast.success(`Categoria "${nova.nome_categoria}" criada!`)
    } catch {
      toast.error('Erro ao criar categoria. Já existe?')
    } finally { setSalvandoCat(false) }
  }

  function iniciarEdicao(p: Produto) {
    setEditando(p)
    setValue('categoria_id', p.categoria_id)
    setValue('nome_modelo',  p.nome_modelo)
    setValue('marca',        p.marca)
    setValue('descricao',    p.descricao ?? '')
    setValue('preco',        p.preco)
    setValue('estoque',      p.estoque)
    setValue('imagens',      p.imagens)
    setValue('vendido',      p.vendido)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelar() { setEditando(null); reset(); setMostrarNovaCat(false); setNovaCategoria('') }

  async function onSubmit(data: ProdutoInput) {
    const payload: ProdutoInput = {
      ...data,
      categoria_id: Number(data.categoria_id),
      preco:        Number(data.preco),
      estoque:      Number(data.estoque),
      cliente_id:   editando?.cliente_id ?? (cliente?.id ?? null),
      vendido:      false,
    }
    try {
      if (editando) {
        await updateProduto(editando.id, payload)
        toast.success('Produto atualizado!')
      } else {
        await createProduto(payload)
        toast.success('Produto criado!')
      }
      cancelar()
      aba === 'todos' ? carregar() : carregarMeus()
    } catch { toast.error('Erro ao salvar produto') }
  }

  async function excluir(id: number) {
    if (!confirm('Excluir este produto?')) return
    try {
      await deleteProduto(id); toast.success('Produto excluído!')
      aba === 'todos' ? carregar() : carregarMeus()
    } catch { toast.error('Erro ao excluir') }
  }

  async function vendido(id: number) {
    if (!confirm('Marcar como VENDIDO? Isso não pode ser desfeito.')) return
    try {
      await marcarVendido(id); toast.success('Marcado como vendido!')
      aba === 'todos' ? carregar() : carregarMeus()
    } catch { toast.error('Erro ao marcar vendido') }
  }

  const nomeCat    = (id: number) => categorias.find(c => c.id === id)?.nome_categoria ?? '—'
  const podeEditar = (p: Produto) => admin || (cliente && cliente.id === p.cliente_id)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-blue-400">Produtos</h2>
        {cliente && (
          <div className="flex gap-2">
            <button onClick={() => setAba('todos')} className={`px-4 py-1 rounded-lg text-sm font-medium transition-colors ${aba === 'todos' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Todos</button>
            <button onClick={() => setAba('meus')}  className={`px-4 py-1 rounded-lg text-sm font-medium transition-colors ${aba === 'meus'  ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Meus Produtos</button>
          </div>
        )}
      </div>

      {(admin || cliente) && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 rounded-xl p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Categoria com opção de adicionar nova */}
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Categoria</label>
            {!mostrarNovaCat ? (
              <div className="flex gap-2 items-start">
                <div className="flex-1">
                  <select {...register('categoria_id', { required: 'Obrigatório' })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500">
                    <option value="">Selecione...</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nome_categoria}</option>)}
                  </select>
                  {errors.categoria_id && <p className="text-red-400 text-xs mt-1">{errors.categoria_id.message}</p>}
                </div>
                <button type="button" onClick={() => setMostrarNovaCat(true)}
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-blue-400 px-3 py-2 rounded-lg transition-colors whitespace-nowrap border border-gray-600">
                  + Nova categoria
                </button>
              </div>
            ) : (
              <div className="bg-gray-900 border border-blue-600 rounded-lg p-3">
                <p className="text-blue-400 text-sm mb-2">🗂️ Não encontrou a categoria? Crie uma nova:</p>
                <div className="flex gap-2">
                  <input
                    value={novaCategoria}
                    onChange={e => setNovaCategoria(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), adicionarCategoria())}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500 text-sm"
                    placeholder="Ex: SSD / NVMe"
                  />
                  <button type="button" onClick={adicionarCategoria} disabled={salvandoCat}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50">
                    {salvandoCat ? '...' : 'Criar'}
                  </button>
                  <button type="button" onClick={() => { setMostrarNovaCat(false); setNovaCategoria('') }}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-2 rounded-lg text-sm transition-colors">
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Modelo</label>
            <input {...register('nome_modelo', { required: 'Obrigatório' })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
              placeholder="Ex: RTX 4070 Ti" />
            {errors.nome_modelo && <p className="text-red-400 text-xs mt-1">{errors.nome_modelo.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Marca</label>
            <input {...register('marca', { required: 'Obrigatório' })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
              placeholder="Ex: ASUS" />
            {errors.marca && <p className="text-red-400 text-xs mt-1">{errors.marca.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Preço (R$)</label>
            <input type="number" step="0.01" {...register('preco', { required: 'Obrigatório' })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
              placeholder="0.00" />
            {errors.preco && <p className="text-red-400 text-xs mt-1">{errors.preco.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Estoque</label>
            <input type="number" {...register('estoque')}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
              placeholder="0" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Imagens (URL no formato JSON)</label>
            <input {...register('imagens')}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
              placeholder='["https://exemplo.com/imagem.jpg"]' />
            <p className="text-gray-600 text-xs mt-1">Use o formato exato com colchetes e aspas duplas</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Descrição</label>
            <textarea {...register('descricao')} rows={3}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Descreva o estado, especificações, motivo da venda..." />
          </div>

          <div className="md:col-span-2 flex gap-3">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              {editando ? 'Atualizar' : 'Adicionar'}
            </button>
            {editando && <button type="button" onClick={cancelar} className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors">Cancelar</button>}
          </div>
        </form>
      )}

      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-700">
            <tr>
              <th className="text-left px-4 py-3 text-gray-300">#</th>
              <th className="text-left px-4 py-3 text-gray-300">Modelo</th>
              <th className="text-left px-4 py-3 text-gray-300">Marca</th>
              <th className="text-left px-4 py-3 text-gray-300">Categoria</th>
              <th className="text-left px-4 py-3 text-gray-300">Preço</th>
              <th className="text-left px-4 py-3 text-gray-300">Status</th>
              <th className="text-right px-4 py-3 text-gray-300">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map(p => (
              <tr key={p.id} className="border-t border-gray-700">
                <td className="px-4 py-3 text-gray-400">{p.id}</td>
                <td className="px-4 py-3 text-gray-100">
                  {p.nome_modelo}
                  {p.descricao && <p className="text-gray-500 text-xs truncate max-w-xs">{p.descricao}</p>}
                </td>
                <td className="px-4 py-3 text-gray-300">{p.marca}</td>
                <td className="px-4 py-3 text-gray-300">{nomeCat(p.categoria_id)}</td>
                <td className="px-4 py-3 text-green-400">R$ {p.preco.toFixed(2)}</td>
                <td className="px-4 py-3">
                  {p.vendido
                    ? <span className="text-xs bg-gray-700 text-gray-400 px-2 py-1 rounded">Vendido</span>
                    : <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">Disponível</span>
                  }
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2 flex-wrap">
                    {podeEditar(p) && !p.vendido && (
                      <>
                        <button onClick={() => iniciarEdicao(p)} className="text-xs bg-yellow-600 hover:bg-yellow-500 px-3 py-1 rounded text-white transition-colors">Editar</button>
                        <button onClick={() => vendido(p.id)}    className="text-xs bg-green-700 hover:bg-green-600 px-3 py-1 rounded text-white transition-colors">Vendido</button>
                        <button onClick={() => excluir(p.id)}    className="text-xs bg-red-700 hover:bg-red-600 px-3 py-1 rounded text-white transition-colors">Excluir</button>
                      </>
                    )}
                  </div>
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
