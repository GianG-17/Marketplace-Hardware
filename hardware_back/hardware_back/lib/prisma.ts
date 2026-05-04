import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
})

export const prisma = new PrismaClient({ adapter })

export async function connectPrisma() {
  try {
    await prisma.$connect()
    console.log('Prisma conectado com sucesso')
  } catch (err) {
    console.error('ERRO AO CONECTAR PRISMA', err)
    throw err
  }
}

export async function ensurePrismaConnected(options?: { retries?: number; delayMs?: number }) {
  const retries = options?.retries ?? 5
  const delayMs = options?.delayMs ?? 2000
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await connectPrisma()
      return
    } catch (err) {
      console.error(`Tentativa ${attempt} de conexão ao Prisma falhou:`, err?.message ?? err)
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, delayMs))
      }
    }
  }
  console.error(`Não foi possível conectar ao Prisma após ${retries} tentativas`)
}