import { Router } from 'express'
import { prisma } from '../../lib/prisma.ts'
import { z } from 'zod'

export const produtosRouter = Router()

const produtoSchema = z.object({
  categoria_id: z.number().int().positive(),
  nome_modelo:  z.string().min(1),
  marca:        z.string().min(1),
  preco:        z.number().positive(),
  estoque:      z.number().int().min(0).default(0),
  imagens:      z.string().default('[]'),
})

produtosRouter.get('/', async (req, res) => {
  const { categoria_id } = req.query
  const produtos = await prisma.produto.findMany({
    where: categoria_id ? { categoria_id: Number(categoria_id) } : undefined,
    include: { categoria: true },
    orderBy: { nome_modelo: 'asc' },
  })
  res.json(produtos)
})

produtosRouter.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const produto = await prisma.produto.findUnique({
    where: { id },
    include: { categoria: true, avaliacoes: { include: { cliente: { select: { nome: true } } } } },
  })
  if (!produto) {
    res.status(404).json({ erro: 'Produto não encontrado' })
    return
  }
  res.json(produto)
})

produtosRouter.post('/', async (req, res) => {
  const resultado = produtoSchema.safeParse(req.body)
  if (!resultado.success) {
    res.status(400).json({ erro: resultado.error.flatten() })
    return
  }
  const produto = await prisma.produto.create({ data: resultado.data })
  res.status(201).json(produto)
})

produtosRouter.put('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const resultado = produtoSchema.safeParse(req.body)
  if (!resultado.success) {
    res.status(400).json({ erro: resultado.error.flatten() })
    return
  }
  const produto = await prisma.produto.update({ where: { id }, data: resultado.data })
  res.json(produto)
})

produtosRouter.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)
  await prisma.produto.delete({ where: { id } })
  res.status(204).send()
})
