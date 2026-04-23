import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext.tsx'
import { loginAdmin } from '../services/api.ts'

type Form = { email: string; senha: string }

export default function LoginAdmin() {
  const { loginAdmin: setAdmin } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm<Form>()

  async function onSubmit(data: Form) {
    try {
      const admin = await loginAdmin(data.email, data.senha)
      setAdmin(admin)
      toast.success(`Bem-vindo, ${admin.nome}!`)
      navigate('/admin/dashboard')
    } catch {
      toast.error('E-mail ou senha inválidos')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-sm shadow-xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-100">Admin: HardwareMP</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">E-mail</label>
            <input {...register('email', { required: 'Obrigatório' })} type="email"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
              placeholder="admin@exemplo.com" />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Senha</label>
            <input {...register('senha', { required: 'Obrigatório' })} type="password"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
              placeholder="••••••••" />
            {errors.senha && <p className="text-red-400 text-xs mt-1">{errors.senha.message}</p>}
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors">
            Entrar
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full bg-gray-700 hover:bg-gray-600 text-gray-100 py-2 rounded-lg font-semibold transition-colors"
          >
            Voltar para tela inicial
          </button>
        </form>
      </div>
    </div>
  )
}
