import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getDashboard, type Dashboard } from '../services/api.ts'
import {
  VictoryBar,
  VictoryPie,
  VictoryChart,
  VictoryAxis,
  VictoryTheme,
  VictoryTooltip,
  VictoryLabel,
} from 'victory'

const CORES_STATUS: Record<string, string> = {
  aguardando: '#eab308',
  aceita:     '#22c55e',
  recusada:   '#ef4444',
}

const CORES_BAR = ['#3b82f6','#8b5cf6','#06b6d4','#f59e0b','#10b981','#ef4444','#ec4899']

export default function AdminDashboard() {
  const [dados, setDados] = useState<Dashboard | null>(null)

  useEffect(() => {
    getDashboard().then(setDados).catch(() => toast.error('Erro ao carregar dashboard'))
  }, [])

  if (!dados) return <div className="text-gray-400 py-10 text-center">Carregando...</div>

  const cards = [
    { label: 'Nº Clientes',   valor: dados.totalClientes,   cor: 'border-blue-600',   bg: 'bg-blue-900/40' },
    { label: 'Nº Produtos',   valor: dados.totalProdutos,   cor: 'border-green-600',  bg: 'bg-green-900/40' },
    { label: 'Nº Propostas',  valor: dados.totalPropostas,  cor: 'border-yellow-600', bg: 'bg-yellow-900/40' },
    { label: 'Nº Avaliações', valor: dados.totalAvaliacoes, cor: 'border-purple-600', bg: 'bg-purple-900/40' },
  ]

  const dadosBar = dados.produtosPorCategoria.map((d, i) => ({
    x: d.nome.length > 12 ? d.nome.slice(0, 12) + '…' : d.nome,
    y: d.total,
    fill: CORES_BAR[i % CORES_BAR.length],
  }))

  const dadosPie = dados.propostasPorStatus.length > 0
    ? dados.propostasPorStatus.map(d => ({
        x: d.status,
        y: d.total,
        label: `${d.status}\n(${d.total})`,
      }))
    : [{ x: 'sem dados', y: 1, label: 'sem dados' }]

  const coresPie = dados.propostasPorStatus.length > 0
    ? dados.propostasPorStatus.map(d => CORES_STATUS[d.status] ?? '#6b7280')
    : ['#374151']

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-100 mb-8">Visão Geral do Sistema</h2>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {cards.map(c => (
          <div key={c.label} className={`${c.bg} border ${c.cor} rounded-xl p-5 text-center`}>
            <p className="text-3xl font-bold text-white mb-1">{c.valor}</p>
            <p className="text-sm text-gray-300">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Gráfico de barras — Victory */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-2">Produtos por Categoria</h3>
          {dadosBar.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">Sem dados</p>
          ) : (
            <VictoryChart
              theme={VictoryTheme.material}
              domainPadding={20}
              height={260}
              padding={{ top: 10, bottom: 60, left: 40, right: 20 }}
            >
              <VictoryAxis
                style={{
                  tickLabels: { fill: '#9ca3af', fontSize: 10, angle: -30, textAnchor: 'end' },
                  axis: { stroke: '#374151' },
                  grid: { stroke: 'transparent' },
                }}
              />
              <VictoryAxis
                dependentAxis
                style={{
                  tickLabels: { fill: '#9ca3af', fontSize: 10 },
                  axis: { stroke: '#374151' },
                  grid: { stroke: '#374151', strokeDasharray: '4' },
                }}
              />
              <VictoryBar
                data={dadosBar}
                style={{
                  data: {
                    fill: ({ datum }: { datum: { fill: string } }) => datum.fill,
                    width: 28,
                  },
                }}
                labelComponent={<VictoryTooltip style={{ fontSize: 10 }} />}
                labels={({ datum }: { datum: { y: number } }) => datum.y}
              />
            </VictoryChart>
          )}
        </div>

        {/* Gráfico de pizza — Victory */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-2">Propostas por Status</h3>
          <VictoryPie
            data={dadosPie}
            colorScale={coresPie}
            height={260}
            padding={60}
            style={{
              labels: { fill: '#e5e7eb', fontSize: 11, fontWeight: 'bold' },
            }}
            labelComponent={
              <VictoryLabel
                style={{ fill: '#e5e7eb', fontSize: 11 }}
              />
            }
          />
          {/* Legenda manual */}
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {dados.propostasPorStatus.map(d => (
              <div key={d.status} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full inline-block" style={{ background: CORES_STATUS[d.status] ?? '#6b7280' }} />
                <span className="text-sm text-gray-300 capitalize">{d.status}</span>
                <span className="text-sm text-gray-500">({d.total})</span>
              </div>
            ))}
            {dados.propostasPorStatus.length === 0 && <p className="text-gray-500 text-sm">Sem propostas ainda</p>}
          </div>
        </div>

      </div>
    </div>
  )
}
