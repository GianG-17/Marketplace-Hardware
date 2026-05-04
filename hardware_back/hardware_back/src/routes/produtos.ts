import { Router } from 'express'
import { prisma } from '../../lib/prisma.ts'
import { z } from 'zod'

export const produtosRouter = Router()

const produtoSchema = z.object({
  categoria_id: z.number().int().positive(),
  cliente_id:   z.number().int().positive().optional().nullable(),
  nome_modelo:  z.string().min(1),
  marca:        z.string().min(1),
  descricao:    z.string().optional().nullable(),
  preco:        z.number().positive(),
  estoque:      z.number().int().min(0).default(0),
  imagens:      z.string().default('[]'),
  vendido:      z.boolean().default(false),
})

function normalizarImagens(imagens: string): string {
  if (!imagens || !imagens.trim()) return '[]'

  const valor = imagens.trim()

  try {
    const arr = JSON.parse(valor)
    if (Array.isArray(arr)) {
      const urls = arr.map(item => String(item).trim()).filter(Boolean)
      return JSON.stringify(urls)
    }
  } catch {
  }

  const urls = valor
    .split(/\r?\n|,|;/)
    .map(item => item.trim())
    .filter(Boolean)

  return JSON.stringify(urls.length > 0 ? urls : [valor])
}

produtosRouter.get('/', async (req, res) => {
  const { categoria_id, cliente_id } = req.query
  console.log('[GET /produtos] query:', { categoria_id, cliente_id })
  const where: Record<string, unknown> = {}
  if (categoria_id) where.categoria_id = Number(categoria_id)
  if (cliente_id)   where.cliente_id   = Number(cliente_id)

  const produtos = await prisma.produto.findMany({
    where,
    include: { categoria: true, cliente: { select: { nome: true, email: true } } },
    orderBy: { criado_em: 'desc' },
  })
  res.json(produtos)
})

produtosRouter.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  console.log('[GET /produtos/:id] id:', id)
  const produto = await prisma.produto.findUnique({
    where: { id },
    include: {
      categoria: true,
      cliente: { select: { nome: true, email: true } },
      avaliacoes: { include: { cliente: { select: { nome: true } } } },
    },
  })
  if (!produto) { res.status(404).json({ erro: 'Produto não encontrado' }); return }
  res.json(produto)
})

produtosRouter.post('/', async (req, res) => {
  console.log('[POST /produtos] body:', req.body)
  const resultado = produtoSchema.safeParse(req.body)
  if (!resultado.success) { res.status(400).json({ erro: resultado.error.flatten() }); return }

  const produto = await prisma.produto.create({
    data: {
      ...resultado.data,
      imagens: normalizarImagens(resultado.data.imagens),
    },
  })
  res.status(201).json(produto)
})

produtosRouter.put('/:id', async (req, res) => {
  const id = Number(req.params.id)
  console.log('[PUT /produtos/:id] id:', id, 'body:', req.body)
  const resultado = produtoSchema.safeParse(req.body)
  if (!resultado.success) { res.status(400).json({ erro: resultado.error.flatten() }); return }

  const produto = await prisma.produto.update({
    where: { id },
    data: {
      ...resultado.data,
      imagens: normalizarImagens(resultado.data.imagens),
    },
  })
  res.json(produto)
})

produtosRouter.patch('/:id/vendido', async (req, res) => {
  const id = Number(req.params.id)
  const produto = await prisma.produto.update({ where: { id }, data: { vendido: true, estoque: 0 } })
  res.json(produto)
})

produtosRouter.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)
  await prisma.produto.delete({ where: { id } })
  res.status(204).send()
})
