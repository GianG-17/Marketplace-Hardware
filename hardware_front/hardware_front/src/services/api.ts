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
export const getCategorias   = ()                         => req<Categoria[]>('/categorias')
export const createCategoria = (d: Omit<Categoria,'id'>) => req<Categoria>('/categorias', { method:'POST', body: JSON.stringify(d) })
export const updateCategoria = (id: number, d: Omit<Categoria,'id'>) => req<Categoria>(`/categorias/${id}`, { method:'PUT', body: JSON.stringify(d) })
export const deleteCategoria = (id: number)              => req<void>(`/categorias/${id}`, { method:'DELETE' })

// ── Produtos ─────────────────────────────────────────────────
export const getProdutos          = ()                           => req<Produto[]>('/produtos')
export const getProdutosPorCliente = (cliente_id: number)       => req<Produto[]>(`/produtos?cliente_id=${cliente_id}`)
export const getProduto           = (id: number)                => req<Produto>(`/produtos/${id}`)
export const createProduto        = (d: ProdutoInput)           => req<Produto>('/produtos', { method:'POST', body: JSON.stringify(d) })
export const updateProduto        = (id: number, d: ProdutoInput) => req<Produto>(`/produtos/${id}`, { method:'PUT', body: JSON.stringify(d) })
export const deleteProduto        = (id: number)                => req<void>(`/produtos/${id}`, { method:'DELETE' })
export const marcarVendido        = (id: number)                => req<Produto>(`/produtos/${id}/vendido`, { method:'PATCH' })

// ── Clientes ─────────────────────────────────────────────────
export const getClientes   = ()                      => req<Cliente[]>('/clientes')
export const createCliente = (d: ClienteInput)       => req<Cliente>('/clientes', { method:'POST', body: JSON.stringify(d) })
export const updateCliente = (id: number, d: ClienteInput) => req<Cliente>(`/clientes/${id}`, { method:'PUT', body: JSON.stringify(d) })
export const deleteCliente = (id: number)            => req<void>(`/clientes/${id}`, { method:'DELETE' })
export const loginCliente  = (email: string, senha: string) =>
  req<Cliente>('/clientes/login', { method:'POST', body: JSON.stringify({ email, senha }) })

// ── Admins ────────────────────────────────────────────────────
export const getAdmins      = ()                      => req<Admin[]>('/admins')
export const loginAdmin     = (email: string, senha: string) =>
  req<Admin>('/admins/login', { method:'POST', body: JSON.stringify({ email, senha }) })
export const getDashboard   = ()                      => req<Dashboard>('/admins/dashboard')
export const createAdmin    = (d: AdminInput)         => req<Admin>('/admins', { method:'POST', body: JSON.stringify(d) })
export const updateAdmin    = (id: number, d: AdminInput) => req<Admin>(`/admins/${id}`, { method:'PUT', body: JSON.stringify(d) })
export const deleteAdmin    = (id: number)            => req<void>(`/admins/${id}`, { method:'DELETE' })

// ── Pedidos ───────────────────────────────────────────────────
export const getPedidos   = ()                     => req<Pedido[]>('/pedidos')
export const createPedido = (d: PedidoInput)       => req<Pedido>('/pedidos', { method:'POST', body: JSON.stringify(d) })
export const updatePedido = (id: number, d: PedidoInput) => req<Pedido>(`/pedidos/${id}`, { method:'PUT', body: JSON.stringify(d) })
export const deletePedido = (id: number)           => req<void>(`/pedidos/${id}`, { method:'DELETE' })

// ── Avaliações ────────────────────────────────────────────────
export const getAvaliacoes           = ()                      => req<Avaliacao[]>('/avaliacoes')
export const getAvaliacoesPorCliente = (cliente_id: number)   => req<Avaliacao[]>(`/avaliacoes?cliente_id=${cliente_id}`)
export const getAvaliacoesPorProduto = (produto_id: number)   => req<Avaliacao[]>(`/avaliacoes?produto_id=${produto_id}`)
export const createAvaliacao         = (d: AvaliacaoInput)    => req<Avaliacao>('/avaliacoes', { method:'POST', body: JSON.stringify(d) })
export const updateAvaliacao         = (id: number, d: AvaliacaoInput) => req<Avaliacao>(`/avaliacoes/${id}`, { method:'PUT', body: JSON.stringify(d) })
export const deleteAvaliacao         = (id: number)           => req<void>(`/avaliacoes/${id}`, { method:'DELETE' })

// ── Propostas ─────────────────────────────────────────────────
export const getPropostas           = ()                       => req<Proposta[]>('/propostas')
export const getPropostasPorCliente = (cliente_id: number)    => req<Proposta[]>(`/propostas?cliente_id=${cliente_id}`)
export const getPropostasPorProduto = (produto_id: number)    => req<Proposta[]>(`/propostas?produto_id=${produto_id}`)
export const createProposta         = (d: PropostaInput)      => req<Proposta>('/propostas', { method:'POST', body: JSON.stringify(d) })
export const responderProposta      = (id: number, d: { resposta: string; status: 'aceita' | 'recusada' }) =>
  req<Proposta>(`/propostas/${id}/responder`, { method:'PATCH', body: JSON.stringify(d) })
export const deleteProposta         = (id: number)            => req<void>(`/propostas/${id}`, { method:'DELETE' })

// ── Types ────────────────────────────────────────────────────
export type Categoria    = { id: number; nome_categoria: string }
export type Produto      = { id: number; categoria_id: number; cliente_id?: number | null; nome_modelo: string; marca: string; descricao?: string | null; preco: number; estoque: number; imagens: string; vendido: boolean; categoria?: Categoria; cliente?: { nome: string; email: string } | null }
export type ProdutoInput = Omit<Produto, 'id' | 'categoria' | 'cliente'>
export type Cliente      = { id: number; nome: string; email: string; telefone?: string; endereco?: string }
export type ClienteInput = Omit<Cliente, 'id'> & { senha_hash: string }
export type Admin        = { id: number; nome: string; email: string; nivel_acesso: string }
export type AdminInput   = Omit<Admin, 'id'> & { senha_hash: string }
export type Pedido       = { id: number; cliente_id: number; valor_total: number; status: string; data_pedido: string }
export type PedidoInput  = Omit<Pedido, 'id' | 'data_pedido'>
export type Avaliacao    = { id: number; cliente_id: number; produto_id: number; nota: number; comentario?: string; criado_em?: string; cliente?: { nome: string }; produto?: { nome_modelo: string; marca: string; imagens: string } }
export type AvaliacaoInput = Omit<Avaliacao, 'id' | 'criado_em' | 'cliente' | 'produto'>
export type Proposta     = { id: number; cliente_id: number; produto_id: number; mensagem: string; resposta?: string | null; status: string; criado_em?: string; cliente?: { nome: string; email: string }; produto?: { nome_modelo: string; marca: string; imagens: string; preco: number; cliente_id?: number | null } }
export type PropostaInput = { cliente_id: number; produto_id: number; mensagem: string }
export type Dashboard    = { totalClientes: number; totalProdutos: number; totalPropostas: number; totalAvaliacoes: number; produtosPorCategoria: { nome: string; total: number }[]; propostasPorStatus: { status: string; total: number }[] }
