import { Router } from 'express'
import { prisma } from '../../lib/prisma.ts'
import { z } from 'zod'

export const avaliacoesRouter = Router()

const avaliacaoSchema = z.object({
  cliente_id: z.number().int().positive(),
  produto_id: z.number().int().positive(),
  nota:       z.number().int().min(1).max(5),
  comentario: z.string().optional(),
})

avaliacoesRouter.get('/', async (req, res) => {
  const { produto_id, cliente_id } = req.query

  const where: Record<string, unknown> = {}
  if (produto_id) where.produto_id = Number(produto_id)
  if (cliente_id) where.cliente_id = Number(cliente_id)

  const avaliacoes = await prisma.avaliacao.findMany({
    where,
    include: {
      cliente: { select: { nome: true } },
      produto: { select: { nome_modelo: true, marca: true, imagens: true } },
    },
    orderBy: { criado_em: 'desc' },
  })
  res.json(avaliacoes)
})

avaliacoesRouter.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const avaliacao = await prisma.avaliacao.findUnique({
    where: { id },
    include: {
      cliente: { select: { nome: true } },
      produto: { select: { nome_modelo: true, marca: true, imagens: true } },
    },
  })
  if (!avaliacao) { res.status(404).json({ erro: 'Avaliação não encontrada' }); return }
  res.json(avaliacao)
})

avaliacoesRouter.post('/', async (req, res) => {
  const resultado = avaliacaoSchema.safeParse(req.body)
  if (!resultado.success) { res.status(400).json({ erro: resultado.error.flatten() }); return }
  const avaliacao = await prisma.avaliacao.create({ data: resultado.data })
  res.status(201).json(avaliacao)
})

avaliacoesRouter.put('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const resultado = avaliacaoSchema.safeParse(req.body)
  if (!resultado.success) { res.status(400).json({ erro: resultado.error.flatten() }); return }
  const avaliacao = await prisma.avaliacao.update({ where: { id }, data: resultado.data })
  res.json(avaliacao)
})

avaliacoesRouter.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)
  await prisma.avaliacao.delete({ where: { id } })
  res.status(204).send()
})
