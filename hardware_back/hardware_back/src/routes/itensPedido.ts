import { Router } from 'express'
import { prisma } from '../../lib/prisma.ts'
import { z } from 'zod'

export const itensPedidoRouter = Router()

const itemSchema = z.object({
  pedido_id:  z.number().int().positive(),
  produto_id: z.number().int().positive(),
  quantidade: z.number().int().positive(),
  preco:      z.number().positive(),
})

itensPedidoRouter.get('/', async (req, res) => {
  const { pedido_id } = req.query
  const itens = await prisma.itemPedido.findMany({
    where: pedido_id ? { pedido_id: Number(pedido_id) } : undefined,
    include: { produto: { select: { nome_modelo: true, marca: true } } },
  })
  res.json(itens)
})

itensPedidoRouter.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const item = await prisma.itemPedido.findUnique({
    where: { id },
    include: { produto: true },
  })
  if (!item) {
    res.status(404).json({ erro: 'Item não encontrado' })
    return
  }
  res.json(item)
})

itensPedidoRouter.post('/', async (req, res) => {
  const resultado = itemSchema.safeParse(req.body)
  if (!resultado.success) {
    res.status(400).json({ erro: resultado.error.flatten() })
    return
  }
  const item = await prisma.itemPedido.create({ data: resultado.data })
  res.status(201).json(item)
})

itensPedidoRouter.put('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const resultado = itemSchema.safeParse(req.body)
  if (!resultado.success) {
    res.status(400).json({ erro: resultado.error.flatten() })
    return
  }
  const item = await prisma.itemPedido.update({ where: { id }, data: resultado.data })
  res.json(item)
})

itensPedidoRouter.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)
  await prisma.itemPedido.delete({ where: { id } })
  res.status(204).send()
})
