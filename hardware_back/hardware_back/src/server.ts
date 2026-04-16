import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import { categoriasRouter } from './routes/categorias.ts'
import { produtosRouter } from './routes/produtos.ts'
import { clientesRouter } from './routes/clientes.ts'
import { pedidosRouter } from './routes/pedidos.ts'
import { itensPedidoRouter } from './routes/itensPedido.ts'

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(cors())
app.use(express.json())

app.use('/categorias', categoriasRouter)
app.use('/produtos', produtosRouter)
app.use('/clientes', clientesRouter)
app.use('/pedidos', pedidosRouter)
app.use('/itens-pedido', itensPedidoRouter)

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
