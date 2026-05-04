import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import { categoriasRouter } from './routes/categorias.ts'
import { produtosRouter }   from './routes/produtos.ts'
import { clientesRouter }   from './routes/clientes.ts'
import { adminsRouter }     from './routes/admins.ts'
import { pedidosRouter }    from './routes/pedidos.ts'
import { itensPedidoRouter } from './routes/itensPedido.ts'
import { avaliacoesRouter } from './routes/avaliacoes.ts'
import { propostasRouter }  from './routes/propostas.ts'
import { ensurePrismaConnected } from '../lib/prisma'

const app = express()
const PORT = process.env.PORT ?? 3000

// Global process handlers to log crashes
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason)
})
// Log uncaught exceptions for diagnostics
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
})

app.use(cors())
app.use(express.json())

app.use('/categorias',  categoriasRouter)
app.use('/produtos',    produtosRouter)
app.use('/clientes',    clientesRouter)
app.use('/admins',      adminsRouter)
app.use('/pedidos',     pedidosRouter)
app.use('/itens-pedido', itensPedidoRouter)
app.use('/avaliacoes',  avaliacoesRouter)
app.use('/propostas',   propostasRouter)

async function start() {
  // Start server regardless of immediate DB connection; attempt to connect in background with retries
  const server = app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
  })
  server.on('error', (err) => {
    console.error('Erro ao iniciar servidor HTTP:', err)
  })

  const isProduction = process.env.NODE_ENV === 'production'

  process.on('SIGINT', () => {
    if (isProduction) {
      console.log('SIGINT recebido, encerrando servidor...')
      server.close(() => process.exit(0))
      return
    }
    console.warn('SIGINT recebido em dev; ignorando para evitar encerramento inesperado.')
  })

  process.on('SIGTERM', () => {
    if (isProduction) {
      console.log('SIGTERM recebido, encerrando servidor...')
      server.close(() => process.exit(0))
      return
    }
    console.warn('SIGTERM recebido em dev; ignorando para evitar encerramento inesperado.')
  })

  if (!isProduction) {
    process.stdin.resume()
  }

  // Attempt to connect to Prisma with retries, but do not abort server start
  ensurePrismaConnected({ retries: 6, delayMs: 2000 }).catch((err) => {
    console.error('ensurePrismaConnected finalizou com erro:', err)
  })
}

start()
