import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getProdutos, getCategorias, type Produto, type Categoria } from '../services/api.ts'

export default function Home() {
  const [produtos, setProdutos]       = useState<Produto[]>([])
  const [filtrados, setFiltrados]     = useState<Produto[]>([])
  const [categorias, setCategorias]   = useState<Categoria[]>([])
  const [busca, setBusca]             = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function carregar() {
      try {
        const [p, c] = await Promise.all([getProdutos(), getCategorias()])
        setProdutos(p)
        setFiltrados(p)
        setCategorias(c)
      } catch {
        toast.error('Erro ao carregar produtos')
      }
    }
    carregar()
  }, [])

  function pesquisar() {
    const termo = busca.toLowerCase().trim()
    if (!termo) {
      setFiltrados(produtos)
      return
    }
    const resultado = produtos.filter(p =>
      p.nome_modelo.toLowerCase().includes(termo) ||
      p.marca.toLowerCase().includes(termo) ||
      categorias.find(c => c.id === p.categoria_id)?.nome_categoria.toLowerCase().includes(termo)
    )
    setFiltrados(resultado)
  }

  function exibirTodos() {
    setBusca('')
    setFiltrados(produtos)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') pesquisar()
  }

  const nomeCat = (id: number) => categorias.find(c => c.id === id)?.nome_categoria ?? '—'

  const primeiraImagem = (imagens: string): string | null => {
    if (!imagens || imagens === '[]') return null
    try {
      const arr = JSON.parse(imagens)
      return Array.isArray(arr) && arr.length > 0 ? arr[0] : null
    } catch {
      return imagens.startsWith('http') ? imagens : null
    }
  }

  return (
    <div>
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-blue-400 mb-2">⚙️ Hardware Marketplace</h1>
        <p className="text-gray-400 text-lg mb-6">Componentes de PC: placas, processadores, memórias e muito mais.</p>

        <div className="flex justify-center gap-2 mb-2">
          <div className="relative w-full max-w-lg">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Modelo, marca ou categoria..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={pesquisar}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors"
          >
            Pesquisar
          </button>
          <button
            onClick={exibirTodos}
            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Exibir Todos
          </button>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-200 mb-4">
        {busca && filtrados.length !== produtos.length
          ? `${filtrados.length} resultado(s) para "${busca}"`
          : 'Produtos em destaque'}
      </h2>

      {filtrados.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          <p className="text-5xl mb-4">🔍</p>
          <p>Nenhum produto encontrado para "{busca}".</p>
          <button onClick={exibirTodos} className="mt-4 text-blue-400 underline">Exibir todos</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtrados.map(p => {
            const img = primeiraImagem(p.imagens)
            return (
              <div
                key={p.id}
                onClick={() => navigate(`/produto/${p.id}`)}
                className="bg-gray-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all flex flex-col cursor-pointer"
              >
                <div className="bg-gray-700 h-48 flex items-center justify-center">
                  {img ? (
                    <img src={img} alt={p.nome_modelo} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-5xl">🖥️</span>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <span className="text-xs text-blue-400 font-medium uppercase tracking-wide mb-1">
                    {nomeCat(p.categoria_id)}
                  </span>
                  <h3 className="text-gray-100 font-semibold text-sm leading-snug mb-1">{p.nome_modelo}</h3>
                  <p className="text-gray-400 text-xs mb-3">{p.marca}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-green-400 font-bold text-lg">
                      R$ {p.preco.toFixed(2)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${p.estoque > 0 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                      {p.estoque > 0 ? `${p.estoque} em estoque` : 'Sem estoque'}
                    </span>
                  </div>
                  <button className="mt-3 text-xs text-blue-400 hover:text-blue-300 text-left transition-colors">
                    Ver Detalhes →
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
