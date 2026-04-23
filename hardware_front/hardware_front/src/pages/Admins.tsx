import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  getAdmins, createAdmin, updateAdmin, deleteAdmin,
  type Admin, type AdminInput,
} from '../services/api.ts'

export default function Admins() {
  const [admins, setAdmins]   = useState<Admin[]>([])
  const [editando, setEditando] = useState<Admin | null>(null)
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AdminInput>()

  async function carregar() {
    try { setAdmins(await getAdmins()) }
    catch { toast.error('Erro ao carregar admins') }
  }

  useEffect(() => { carregar() }, [])

  function iniciarEdicao(a: Admin) {
    setEditando(a)
    setValue('nome',         a.nome)
    setValue('email',        a.email)
    setValue('nivel_acesso', a.nivel_acesso)
    setValue('senha_hash',   '')
  }

  function cancelar() { setEditando(null); reset() }

  async function onSubmit(data: AdminInput) {
    try {
      if (editando) {
        await updateAdmin(editando.id, data)
        toast.success('Admin atualizado!')
      } else {
        await createAdmin(data)
        toast.success('Admin criado!')
      }
      cancelar(); carregar()
    } catch {
      toast.error('Erro ao salvar admin')
    }
  }

  async function excluir(id: number) {
    if (!confirm('Excluir este admin?')) return
    try {
      await deleteAdmin(id)
      toast.success('Admin excluído!')
      carregar()
    } catch {
      toast.error('Erro ao excluir admin')
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-400 mb-6">Admins</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 rounded-xl p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Nome</label>
          <input {...register('nome', { required: 'Obrigatório' })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500" placeholder="Nome completo" />
          {errors.nome && <p className="text-red-400 text-xs mt-1">{errors.nome.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">E-mail</label>
          <input {...register('email', { required: 'Obrigatório' })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500" placeholder="admin@exemplo.com" />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Senha</label>
          <input type="password" {...register('senha_hash', { required: !editando ? 'Obrigatório' : false })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500" placeholder="mínimo 6 caracteres" />
          {errors.senha_hash && <p className="text-red-400 text-xs mt-1">{errors.senha_hash.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Nível de Acesso</label>
          <select {...register('nivel_acesso')} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500">
            <option value="moderador">Moderador</option>
            <option value="super">Super</option>
          </select>
        </div>

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
              <th className="text-left px-4 py-3 text-gray-300">Nível</th>
              <th className="text-right px-4 py-3 text-gray-300">Ações</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(a => (
              <tr key={a.id} className="border-t border-gray-700">
                <td className="px-4 py-3 text-gray-400">{a.id}</td>
                <td className="px-4 py-3 text-gray-100">{a.nome}</td>
                <td className="px-4 py-3 text-gray-300">{a.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded font-medium ${a.nivel_acesso === 'super' ? 'bg-purple-700 text-purple-100' : 'bg-blue-800 text-blue-200'}`}>
                    {a.nivel_acesso}
                  </span>
                </td>
                <td className="px-4 py-3 text-right flex justify-end gap-2">
                  <button onClick={() => iniciarEdicao(a)} className="text-xs bg-yellow-600 hover:bg-yellow-500 px-3 py-1 rounded text-white transition-colors">Editar</button>
                  <button onClick={() => excluir(a.id)} className="text-xs bg-red-700 hover:bg-red-600 px-3 py-1 rounded text-white transition-colors">Excluir</button>
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr><td colSpan={5} className="text-center text-gray-500 py-8">Nenhum admin cadastrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
