import { Router } from 'express'
import { prisma } from '../../lib/prisma.ts'
import { z } from 'zod'

export const pedidosRouter = Router()

const pedidoSchema = z.object({
  cliente_id:  z.number().int().positive(),
  valor_total: z.number().positive(),
  status:      z.enum(['pendente', 'pago', 'enviado', 'entregue', 'cancelado']).default('pendente'),
})

pedidosRouter.get('/', async (req, res) => {
  const { cliente_id } = req.query
  const pedidos = await prisma.pedido.findMany({
    where: cliente_id ? { cliente_id: Number(cliente_id) } : undefined,
    include: {
      cliente: { select: { nome: true, email: true } },
      itens_pedido: { include: { produto: { select: { nome_modelo: true, marca: true } } } },
    },
    orderBy: { data_pedido: 'desc' },
  })
  res.json(pedidos)
})

pedidosRouter.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: {
      cliente: { select: { nome: true, email: true } },
      itens_pedido: { include: { produto: true } },
    },
  })
  if (!pedido) {
    res.status(404).json({ erro: 'Pedido não encontrado' })
    return
  }
  res.json(pedido)
})

pedidosRouter.post('/', async (req, res) => {
  const resultado = pedidoSchema.safeParse(req.body)
  if (!resultado.success) {
    res.status(400).json({ erro: resultado.error.flatten() })
    return
  }
  const pedido = await prisma.pedido.create({ data: resultado.data })
  res.status(201).json(pedido)
})

pedidosRouter.put('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const resultado = pedidoSchema.safeParse(req.body)
  if (!resultado.success) {
    res.status(400).json({ erro: resultado.error.flatten() })
    return
  }
  const pedido = await prisma.pedido.update({ where: { id }, data: resultado.data })
  res.json(pedido)
})

pedidosRouter.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)
  await prisma.pedido.delete({ where: { id } })
  res.status(204).send()
})
