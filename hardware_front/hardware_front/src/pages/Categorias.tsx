import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  getCategorias, createCategoria, updateCategoria, deleteCategoria,
  type Categoria,
} from '../services/api.ts'

type FormData = { nome_categoria: string }

export default function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [editando, setEditando] = useState<Categoria | null>(null)
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>()

  async function carregar() {
    try {
      setCategorias(await getCategorias())
    } catch {
      toast.error('Erro ao carregar categorias')
    }
  }

  useEffect(() => { carregar() }, [])

  function iniciarEdicao(c: Categoria) {
    setEditando(c)
    setValue('nome_categoria', c.nome_categoria)
  }

  function cancelar() {
    setEditando(null)
    reset()
  }

  async function onSubmit(data: FormData) {
    try {
      if (editando) {
        await updateCategoria(editando.id, data)
        toast.success('Categoria atualizada!')
      } else {
        await createCategoria(data)
        toast.success('Categoria criada!')
      }
      cancelar()
      carregar()
    } catch {
      toast.error('Erro ao salvar categoria')
    }
  }

  async function excluir(id: number) {
    if (!confirm('Excluir esta categoria?')) return
    try {
      await deleteCategoria(id)
      toast.success('Categoria excluída!')
      carregar()
    } catch {
      toast.error('Erro ao excluir categoria')
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-400 mb-6">Categorias</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 rounded-xl p-6 mb-8 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm text-gray-400 mb-1">Nome da Categoria</label>
          <input
            {...register('nome_categoria', { required: 'Campo obrigatório' })}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
            placeholder="Ex: Placas de Vídeo"
          />
          {errors.nome_categoria && <p className="text-red-400 text-xs mt-1">{errors.nome_categoria.message}</p>}
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors">
          {editando ? 'Atualizar' : 'Adicionar'}
        </button>
        {editando && (
          <button type="button" onClick={cancelar} className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors">
            Cancelar
          </button>
        )}
      </form>

      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="text-left px-4 py-3 text-sm text-gray-300">#</th>
              <th className="text-left px-4 py-3 text-sm text-gray-300">Nome</th>
              <th className="text-right px-4 py-3 text-sm text-gray-300">Ações</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map(c => (
              <tr key={c.id} className="border-t border-gray-700 hover:bg-gray-750">
                <td className="px-4 py-3 text-gray-400 text-sm">{c.id}</td>
                <td className="px-4 py-3 text-gray-100">{c.nome_categoria}</td>
                <td className="px-4 py-3 text-right flex justify-end gap-2">
                  <button onClick={() => iniciarEdicao(c)} className="text-xs bg-yellow-600 hover:bg-yellow-500 px-3 py-1 rounded text-white transition-colors">Editar</button>
                  <button onClick={() => excluir(c.id)} className="text-xs bg-red-700 hover:bg-red-600 px-3 py-1 rounded text-white transition-colors">Excluir</button>
                </td>
              </tr>
            ))}
            {categorias.length === 0 && (
              <tr><td colSpan={3} className="text-center text-gray-500 py-8">Nenhuma categoria cadastrada</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
