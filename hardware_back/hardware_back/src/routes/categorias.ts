import { Router } from 'express'
import { prisma } from '../../lib/prisma.ts'
import { z } from 'zod'

export const categoriasRouter = Router()

const categoriaSchema = z.object({
  nome_categoria: z.string().min(1),
})

categoriasRouter.get('/', async (req, res) => {
  const categorias = await prisma.categoria.findMany({
    orderBy: { nome_categoria: 'asc' },
  })
  res.json(categorias)
})

categoriasRouter.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const categoria = await prisma.categoria.findUnique({ where: { id } })
  if (!categoria) {
    res.status(404).json({ erro: 'Categoria não encontrada' })
    return
  }
  res.json(categoria)
})

categoriasRouter.post('/', async (req, res) => {
  const resultado = categoriaSchema.safeParse(req.body)
  if (!resultado.success) {
    res.status(400).json({ erro: resultado.error.flatten() })
    return
  }
  const categoria = await prisma.categoria.create({ data: resultado.data })
  res.status(201).json(categoria)
})

categoriasRouter.put('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const resultado = categoriaSchema.safeParse(req.body)
  if (!resultado.success) {
    res.status(400).json({ erro: resultado.error.flatten() })
    return
  }
  const categoria = await prisma.categoria.update({
    where: { id },
    data: resultado.data,
  })
  res.json(categoria)
})

categoriasRouter.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)
  await prisma.categoria.delete({ where: { id } })
  res.status(204).send()
})
