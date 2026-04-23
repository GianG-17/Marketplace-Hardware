import { Router } from 'express'
import { prisma } from '../../lib/prisma.ts'
import { z } from 'zod'
import { hashPassword, verifyPassword } from '../utils/password'

export const clientesRouter = Router()

const clienteSchema = z.object({
  nome:       z.string().min(1),
  email:      z.string().email(),   
  senha_hash: z.string().min(6),
  telefone:   z.string().optional(),
  endereco:   z.string().optional(),
})

const clienteUpdateSchema = z.object({
  nome:       z.string().min(1),
  email:      z.string().email(),
  senha_hash: z.union([z.string().min(6), z.literal('')]).optional(),
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
  if (!cliente) {
    res.status(401).json({ erro: 'E-mail ou senha inválidos' })
    return
  }

  let senhaValida = await verifyPassword(senha, cliente.senha_hash)

  if (!senhaValida && cliente.senha_hash === senha) {
    const senhaNovaHash = await hashPassword(senha)
    await prisma.cliente.update({ where: { id: cliente.id }, data: { senha_hash: senhaNovaHash } })
    senhaValida = true
  }

  if (!senhaValida) {
    res.status(401).json({ erro: 'E-mail ou senha inválidos' })
    return
  }

  res.json({ id: cliente.id, nome: cliente.nome, email: cliente.email })
})

clientesRouter.post('/', async (req, res) => {
  const resultado = clienteSchema.safeParse(req.body)
  if (!resultado.success) { res.status(400).json({ erro: resultado.error.flatten() }); return }

  const senhaHash = await hashPassword(resultado.data.senha_hash)

  const cliente = await prisma.cliente.create({
    data: {
      ...resultado.data,
      senha_hash: senhaHash,
    },
    select: { id: true, nome: true, email: true, criado_em: true },
  })
  res.status(201).json(cliente)
})

clientesRouter.put('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const resultado = clienteUpdateSchema.safeParse(req.body)
  if (!resultado.success) { res.status(400).json({ erro: resultado.error.flatten() }); return }

  const dataAtualizacao: {
    nome: string
    email: string
    telefone?: string
    endereco?: string
    senha_hash?: string
  } = {
    nome: resultado.data.nome,
    email: resultado.data.email,
    telefone: resultado.data.telefone,
    endereco: resultado.data.endereco,
  }

  if (resultado.data.senha_hash && resultado.data.senha_hash.trim() !== '') {
    dataAtualizacao.senha_hash = await hashPassword(resultado.data.senha_hash)
  }

  const cliente = await prisma.cliente.update({
    where: { id },
    data: dataAtualizacao,
    select: { id: true, nome: true, email: true, criado_em: true },
  })
  res.json(cliente)
})

clientesRouter.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)
  await prisma.cliente.delete({ where: { id } })
  res.status(204).send()
})
