import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getProdutos, getCategorias, type Produto, type Categoria } from '../services/api.ts'

export default function Home() {
  const [produtos, setProdutos]     = useState<Produto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])

  useEffect(() => {
    async function carregar() {
      try {
        const [p, c] = await Promise.all([getProdutos(), getCategorias()])
        setProdutos(p)
        setCategorias(c)
      } catch {
        toast.error('Erro ao carregar produtos')
      }
    }
    carregar()
  }, [])

  const nomeCat = (id: number) => categorias.find(c => c.id === id)?.nome_categoria ?? '—'

  const primeiraImagem = (imagens: string): string | null => {
    try {
      const arr = JSON.parse(imagens)
      return Array.isArray(arr) && arr.length > 0 ? arr[0] : null
    } catch {
      return null
    }
  }

  return (
    <div>
      <div className="text-center py-10">
        <h1 className="text-4xl font-bold text-blue-400 mb-2">Hardware Marketplace</h1>
        <p className="text-gray-400 text-lg">Componentes de PC: placas, processadores, memórias e muito mais.</p>
      </div>

      {produtos.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          <p className="text-5xl mb-4"></p>
          <p>Nenhum produto cadastrado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {produtos.map(p => {
            const img = primeiraImagem(p.imagens)
            return (
              <div key={p.id} className="bg-gray-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all flex flex-col">
                <div className="bg-gray-700 h-48 flex items-center justify-center">
                  {img ? (
                    <img src={img} alt={p.nome_modelo} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-5xl"></span>
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
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}