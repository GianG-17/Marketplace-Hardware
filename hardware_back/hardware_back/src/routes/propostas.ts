import { Router } from 'express'
import { prisma } from '../../lib/prisma.ts'
import { z } from 'zod'

export const propostasRouter = Router()

const propostaSchema = z.object({
  cliente_id: z.number().int().positive(),
  produto_id: z.number().int().positive(),
  mensagem:   z.string().min(1),
})

const respostaSchema = z.object({
  resposta: z.string().min(1),
  status:   z.enum(['aceita', 'recusada']),
})

propostasRouter.get('/', async (req, res) => {
  const { cliente_id, produto_id } = req.query
  console.log('[GET /propostas] query:', { cliente_id, produto_id })
  const where: Record<string, unknown> = {}
  if (cliente_id) where.cliente_id = Number(cliente_id)
  if (produto_id) where.produto_id = Number(produto_id)

  const propostas = await prisma.proposta.findMany({
    where,
    include: {
      cliente: { select: { nome: true, email: true } },
      produto: { select: { nome_modelo: true, marca: true, imagens: true, preco: true, cliente_id: true } },
    },
    orderBy: { criado_em: 'desc' },
  })
  res.json(propostas)
})

propostasRouter.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  console.log('[GET /propostas/:id] id:', id)
  const proposta = await prisma.proposta.findUnique({
    where: { id },
    include: {
      cliente: { select: { nome: true, email: true } },
      produto: { select: { nome_modelo: true, marca: true, imagens: true, preco: true } },
    },
  })
  if (!proposta) { res.status(404).json({ erro: 'Proposta não encontrada' }); return }
  res.json(proposta)
})

propostasRouter.post('/', async (req, res) => {
  console.log('[POST /propostas] body:', req.body)
  const resultado = propostaSchema.safeParse(req.body)
  if (!resultado.success) { res.status(400).json({ erro: resultado.error.flatten() }); return }
  const proposta = await prisma.proposta.create({ data: resultado.data })
  res.status(201).json(proposta)
})

propostasRouter.patch('/:id/responder', async (req, res) => {
  const id = Number(req.params.id)
  console.log('[PATCH /propostas/:id/responder] id:', id, 'body:', req.body)
  const resultado = respostaSchema.safeParse(req.body)
  if (!resultado.success) { res.status(400).json({ erro: resultado.error.flatten() }); return }
  const proposta = await prisma.proposta.update({
    where: { id },
    data: { resposta: resultado.data.resposta, status: resultado.data.status },
  })
  res.json(proposta)
})

propostasRouter.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)
  console.log('[DELETE /propostas/:id] id:', id)
  await prisma.proposta.delete({ where: { id } })
  res.status(204).send()
})
