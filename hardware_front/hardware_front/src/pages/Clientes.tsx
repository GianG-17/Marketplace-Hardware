import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  getClientes, createCliente, updateCliente, deleteCliente,
  type Cliente, type ClienteInput,
} from '../services/api.ts'

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [editando, setEditando] = useState<Cliente | null>(null)
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ClienteInput>()

  async function carregar() {
    try { setClientes(await getClientes()) }
    catch { toast.error('Erro ao carregar clientes') }
  }

  useEffect(() => { carregar() }, [])

  function iniciarEdicao(c: Cliente) {
    setEditando(c)
    setValue('nome',     c.nome)
    setValue('email',    c.email)
    setValue('telefone', c.telefone ?? '')
    setValue('endereco', c.endereco ?? '')
    setValue('senha_hash', '')
  }

  function cancelar() { setEditando(null); reset() }

  async function onSubmit(data: ClienteInput) {
    try {
      if (editando) {
        await updateCliente(editando.id, data)
        toast.success('Cliente atualizado!')
      } else {
        await createCliente(data)
        toast.success('Cliente criado!')
      }
      cancelar(); carregar()
    } catch {
      toast.error('Erro ao salvar cliente')
    }
  }

  async function excluir(id: number) {
    if (!confirm('Excluir este cliente?')) return
    try {
      await deleteCliente(id)
      toast.success('Cliente excluído!')
      carregar()
    } catch {
      toast.error('Erro ao excluir cliente')
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-400 mb-6">Clientes</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 rounded-xl p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: 'nome' as const,      label: 'Nome',     placeholder: 'Nome completo', required: true },
          { name: 'email' as const,     label: 'E-mail',   placeholder: 'email@exemplo.com', required: true },
          { name: 'telefone' as const,  label: 'Telefone', placeholder: '(51) 99999-9999', required: false },
          { name: 'endereco' as const,  label: 'Endereço', placeholder: 'Rua, número, cidade', required: false },
          { name: 'senha_hash' as const, label: 'Senha',   placeholder: 'mínimo 6 caracteres', required: !editando },
        ].map(f => (
          <div key={f.name}>
            <label className="block text-sm text-gray-400 mb-1">{f.label}</label>
            <input
              {...register(f.name, f.required ? { required: 'Obrigatório' } : {})}
              type={f.name === 'senha_hash' ? 'password' : 'text'}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
              placeholder={f.placeholder}
            />
            {errors[f.name] && <p className="text-red-400 text-xs mt-1">{errors[f.name]?.message}</p>}
          </div>
        ))}

        <div className="md:col-span-2 flex gap-3">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            {editando ? 'Atualizar' : 'Adicionar'}
          </button>
          {editando && (
            <button type="button" onClick={cancelar} className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors">Cancelar</button>
          )}
        </div>
      </form>

      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-700">
            <tr>
              <th className="text-left px-4 py-3 text-gray-300">#</th>
              <th className="text-left px-4 py-3 text-gray-300">Nome</th>
              <th className="text-left px-4 py-3 text-gray-300">E-mail</th>
              <th className="text-left px-4 py-3 text-gray-300">Telefone</th>
              <th className="text-right px-4 py-3 text-gray-300">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(c => (
              <tr key={c.id} className="border-t border-gray-700">
                <td className="px-4 py-3 text-gray-400">{c.id}</td>
                <td className="px-4 py-3 text-gray-100">{c.nome}</td>
                <td className="px-4 py-3 text-gray-300">{c.email}</td>
                <td className="px-4 py-3 text-gray-300">{c.telefone ?? '—'}</td>
                <td className="px-4 py-3 text-right flex justify-end gap-2">
                  <button onClick={() => iniciarEdicao(c)} className="text-xs bg-yellow-600 hover:bg-yellow-500 px-3 py-1 rounded text-white transition-colors">Editar</button>
                  <button onClick={() => excluir(c.id)} className="text-xs bg-red-700 hover:bg-red-600 px-3 py-1 rounded text-white transition-colors">Excluir</button>
                </td>
              </tr>
            ))}
            {clientes.length === 0 && (
              <tr><td colSpan={5} className="text-center text-gray-500 py-8">Nenhum cliente cadastrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
