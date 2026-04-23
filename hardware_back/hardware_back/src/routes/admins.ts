import { Router } from 'express'
import { prisma } from '../../lib/prisma.ts'
import { z } from 'zod'

export const adminsRouter = Router()

const adminSchema = z.object({
  nome:         z.string().min(1),
  email:        z.string().email(),
  senha_hash:   z.string().min(6),
  nivel_acesso: z.enum(['moderador', 'super']).default('moderador'),
})

adminsRouter.get('/', async (req, res) => {
  const admins = await prisma.admin.findMany({
    select: { id: true, nome: true, email: true, nivel_acesso: true, criado_em: true },
    orderBy: { nome: 'asc' },
  })
  res.json(admins)
})

adminsRouter.post('/login', async (req, res) => {
  const { email, senha } = req.body
  if (!email || !senha) { res.status(400).json({ erro: 'E-mail e senha obrigatórios' }); return }
  const admin = await prisma.admin.findUnique({ where: { email } })
  if (!admin || admin.senha_hash !== senha) {
    res.status(401).json({ erro: 'E-mail ou senha inválidos' })
    return
  }
  res.json({ id: admin.id, nome: admin.nome, email: admin.email, nivel_acesso: admin.nivel_acesso })
})

adminsRouter.get('/dashboard', async (req, res) => {
  const [totalClientes, totalProdutos, totalPropostas, totalAvaliacoes, produtosPorCategoria, propostalsPorStatus] = await Promise.all([
    prisma.cliente.count(),
    prisma.produto.count(),
    prisma.proposta.count(),
    prisma.avaliacao.count(),
    prisma.categoria.findMany({
      include: { _count: { select: { produtos: true } } },
    }),
    prisma.proposta.groupBy({ by: ['status'], _count: { status: true } }),
  ])
  res.json({
    totalClientes,
    totalProdutos,
    totalPropostas,
    totalAvaliacoes,
    produtosPorCategoria: produtosPorCategoria.map(c => ({
      nome: c.nome_categoria,
      total: c._count.produtos,
    })),
    propostasPorStatus: propostalsPorStatus.map(p => ({
      status: p.status,
      total: p._count.status,
    })),
  })
})

adminsRouter.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const admin = await prisma.admin.findUnique({
    where: { id },
    select: { id: true, nome: true, email: true, nivel_acesso: true, criado_em: true },
  })
  if (!admin) { res.status(404).json({ erro: 'Admin não encontrado' }); return }
  res.json(admin)
})

adminsRouter.post('/', async (req, res) => {
  const resultado = adminSchema.safeParse(req.body)
  if (!resultado.success) { res.status(400).json({ erro: resultado.error.flatten() }); return }
  const admin = await prisma.admin.create({
    data: resultado.data,
    select: { id: true, nome: true, email: true, nivel_acesso: true, criado_em: true },
  })
  res.status(201).json(admin)
})

adminsRouter.put('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const resultado = adminSchema.safeParse(req.body)
  if (!resultado.success) { res.status(400).json({ erro: resultado.error.flatten() }); return }
  const admin = await prisma.admin.update({
    where: { id },
    data: resultado.data,
    select: { id: true, nome: true, email: true, nivel_acesso: true, criado_em: true },
  })
  res.json(admin)
})

adminsRouter.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)
  await prisma.admin.delete({ where: { id } })
  res.status(204).send()
})
