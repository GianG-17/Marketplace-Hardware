import { Router } from 'express'
import { prisma } from '../../lib/prisma.ts'
import { z } from 'zod'

export const clientesRouter = Router()

const clienteSchema = z.object({
  nome:       z.string().min(1),
  email:      z.string().email(),   
  senha_hash: z.string().min(6),
  telefone:   z.string().optional(),
  endereco:   z.string().optional(),
})

clientesRouter.get('/', async (req, res) => {
  const clientes = await prisma.cliente.findMany({
    select: { id: true, nome: true, email: true, telefone: true, endereco: true, criado_em: true },
    orderBy: { nome: 'asc' },
  })
  res.json(clientes)
})

clientesRouter.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    select: { id: true, nome: true, email: true, telefone: true, endereco: true, criado_em: true },
  })
  if (!cliente) { res.status(404).json({ erro: 'Cliente não encontrado' }); return }
  res.json(cliente)
})

clientesRouter.post('/login', async (req, res) => {
  const { email, senha } = req.body
  if (!email || !senha) { res.status(400).json({ erro: 'E-mail e senha obrigatórios' }); return }
  const cliente = await prisma.cliente.findUnique({ where: { email } })
  if (!cliente || cliente.senha_hash !== senha) {
    res.status(401).json({ erro: 'E-mail ou senha inválidos' })
    return
  }
  res.json({ id: cliente.id, nome: cliente.nome, email: cliente.email })
})

clientesRouter.post('/', async (req, res) => {
  const resultado = clienteSchema.safeParse(req.body)
  if (!resultado.success) { res.status(400).json({ erro: resultado.error.flatten() }); return }
  const cliente = await prisma.cliente.create({
    data: resultado.data,
    select: { id: true, nome: true, email: true, criado_em: true },
  })
  res.status(201).json(cliente)
})

clientesRouter.put('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const resultado = clienteSchema.safeParse(req.body)
  if (!resultado.success) { res.status(400).json({ erro: resultado.error.flatten() }); return }
  const cliente = await prisma.cliente.update({
    where: { id },
    data: resultado.data,
    select: { id: true, nome: true, email: true, criado_em: true },
  })
  res.json(cliente)
})

clientesRouter.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)
  await prisma.cliente.delete({ where: { id } })
  res.status(204).send()
})
