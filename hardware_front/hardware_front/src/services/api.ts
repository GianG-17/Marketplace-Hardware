const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`Erro ${res.status}`)
  if (res.status === 204) return undefined as T
  return res.json()
}

// ── Categorias ────────────────────────────────────────────────
export const getCategorias  = ()       => req<Categoria[]>('/categorias')
export const createCategoria = (d: Omit<Categoria,'id'>) => req<Categoria>('/categorias', { method:'POST', body: JSON.stringify(d) })
export const updateCategoria = (id: number, d: Omit<Categoria,'id'>) => req<Categoria>(`/categorias/${id}`, { method:'PUT', body: JSON.stringify(d) })
export const deleteCategoria = (id: number) => req<void>(`/categorias/${id}`, { method:'DELETE' })

// ── Produtos ─────────────────────────────────────────────────
export const getProdutos  = ()       => req<Produto[]>('/produtos')
export const createProduto = (d: ProdutoInput) => req<Produto>('/produtos', { method:'POST', body: JSON.stringify(d) })
export const updateProduto = (id: number, d: ProdutoInput) => req<Produto>(`/produtos/${id}`, { method:'PUT', body: JSON.stringify(d) })
export const deleteProduto = (id: number) => req<void>(`/produtos/${id}`, { method:'DELETE' })

// ── Clientes ─────────────────────────────────────────────────
export const getClientes  = ()       => req<Cliente[]>('/clientes')
export const createCliente = (d: ClienteInput) => req<Cliente>('/clientes', { method:'POST', body: JSON.stringify(d) })
export const updateCliente = (id: number, d: ClienteInput) => req<Cliente>(`/clientes/${id}`, { method:'PUT', body: JSON.stringify(d) })
export const deleteCliente = (id: number) => req<void>(`/clientes/${id}`, { method:'DELETE' })

// ── Admins ────────────────────────────────────────────────────
export const getAdmins  = ()       => req<Admin[]>('/admins')
export const createAdmin = (d: AdminInput) => req<Admin>('/admins', { method:'POST', body: JSON.stringify(d) })
export const updateAdmin = (id: number, d: AdminInput) => req<Admin>(`/admins/${id}`, { method:'PUT', body: JSON.stringify(d) })
export const deleteAdmin = (id: number) => req<void>(`/admins/${id}`, { method:'DELETE' })

// ── Pedidos ───────────────────────────────────────────────────
export const getPedidos  = ()       => req<Pedido[]>('/pedidos')
export const createPedido = (d: PedidoInput) => req<Pedido>('/pedidos', { method:'POST', body: JSON.stringify(d) })
export const updatePedido = (id: number, d: PedidoInput) => req<Pedido>(`/pedidos/${id}`, { method:'PUT', body: JSON.stringify(d) })
export const deletePedido = (id: number) => req<void>(`/pedidos/${id}`, { method:'DELETE' })

// ── Avaliações ────────────────────────────────────────────────
export const getAvaliacoes  = ()       => req<Avaliacao[]>('/avaliacoes')
export const createAvaliacao = (d: AvaliacaoInput) => req<Avaliacao>('/avaliacoes', { method:'POST', body: JSON.stringify(d) })
export const updateAvaliacao = (id: number, d: AvaliacaoInput) => req<Avaliacao>(`/avaliacoes/${id}`, { method:'PUT', body: JSON.stringify(d) })
export const deleteAvaliacao = (id: number) => req<void>(`/avaliacoes/${id}`, { method:'DELETE' })

// ── Types ────────────────────────────────────────────────────
export type Categoria   = { id: number; nome_categoria: string }
export type Produto     = { id: number; categoria_id: number; nome_modelo: string; marca: string; preco: number; estoque: number; imagens: string }
export type ProdutoInput = Omit<Produto, 'id'>
export type Cliente     = { id: number; nome: string; email: string; telefone?: string; endereco?: string }
export type ClienteInput = Omit<Cliente, 'id'> & { senha_hash: string }
export type Admin       = { id: number; nome: string; email: string; nivel_acesso: string }
export type AdminInput  = Omit<Admin, 'id'> & { senha_hash: string }
export type Pedido      = { id: number; cliente_id: number; valor_total: number; status: string; data_pedido: string }
export type PedidoInput = Omit<Pedido, 'id' | 'data_pedido'>
export type Avaliacao   = { id: number; cliente_id: number; produto_id: number; nota: number; comentario?: string }
export type AvaliacaoInput = Omit<Avaliacao, 'id'>
