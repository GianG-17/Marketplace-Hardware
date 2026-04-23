import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext.tsx'
import { createCliente, getClientes } from '../services/api.ts'

type LoginForm   = { email: string; senha: string; manter: boolean }
type CadastroForm = { nome: string; email: string; senha: string; confirmar: string; telefone?: string }

export default function Login() {
  const [modo, setModo] = useState<'login' | 'cadastro'>('login')
  const { loginCliente } = useAuth()
  const navigate = useNavigate()

  const loginForm   = useForm<LoginForm>()
  const cadastroForm = useForm<CadastroForm>()

  async function onLogin(data: LoginForm) {
    try {
      const clientes = await getClientes()
      const encontrado = clientes.find(c => c.email === data.email)
      if (!encontrado) { toast.error('E-mail não cadastrado'); return }
      loginCliente({ id: encontrado.id, nome: encontrado.nome, email: encontrado.email }, data.manter)
      toast.success(`Bem-vindo, ${encontrado.nome}!`)
      navigate('/')
    } catch {
      toast.error('Erro ao fazer login')
    }
  }

  async function onCadastro(data: CadastroForm) {
    if (data.senha !== data.confirmar) { toast.error('As senhas não coincidem'); return }
    try {
      const novo = await createCliente({
        nome:       data.nome,
        email:      data.email,
        senha_hash: data.senha,
        telefone:   data.telefone || undefined,
      })
      loginCliente({ id: novo.id, nome: novo.nome, email: novo.email }, false)
      toast.success('Conta criada com sucesso!')
      navigate('/')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao criar conta.')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md shadow-xl">

        {modo === 'login' ? (
          <>
            <h2 className="text-2xl font-bold text-gray-100 mb-6 text-center">Dados de Acesso do Cliente</h2>
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Seu e-mail</label>
                <input {...loginForm.register('email', { required: 'Obrigatório' })} type="email"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
                  placeholder="seu@email.com" />
                {loginForm.formState.errors.email && <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Senha de Acesso</label>
                <input {...loginForm.register('senha', { required: 'Obrigatório' })} type="password"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
                  placeholder="••••••••" />
                {loginForm.formState.errors.senha && <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.senha.message}</p>}
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input {...loginForm.register('manter')} type="checkbox" className="accent-blue-500" />
                Manter Conectado
              </label>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors">Entrar</button>
            </form>
            <p className="text-center text-sm text-gray-400 mt-4">
              Ainda não possui conta?{' '}
              <button onClick={() => setModo('cadastro')} className="text-blue-400 hover:underline">Cadastre-se</button>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-100 mb-6 text-center">Criar Conta</h2>
            <form onSubmit={cadastroForm.handleSubmit(onCadastro)} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nome completo</label>
                <input {...cadastroForm.register('nome', { required: 'Obrigatório' })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
                  placeholder="Seu nome" />
                {cadastroForm.formState.errors.nome && <p className="text-red-400 text-xs mt-1">{cadastroForm.formState.errors.nome.message}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">E-mail</label>
                <input {...cadastroForm.register('email', { required: 'Obrigatório' })} type="email"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
                  placeholder="seu@email.com" />
                {cadastroForm.formState.errors.email && <p className="text-red-400 text-xs mt-1">{cadastroForm.formState.errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Telefone (opcional)</label>
                <input {...cadastroForm.register('telefone')}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
                  placeholder="(51) 99999-9999" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Senha</label>
                <input {...cadastroForm.register('senha', { required: 'Obrigatório', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })} type="password"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
                  placeholder="mínimo 6 caracteres" />
                {cadastroForm.formState.errors.senha && <p className="text-red-400 text-xs mt-1">{cadastroForm.formState.errors.senha.message}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Confirmar Senha</label>
                <input {...cadastroForm.register('confirmar', { required: 'Obrigatório' })} type="password"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
                  placeholder="repita a senha" />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors">Criar Conta</button>
            </form>
            <p className="text-center text-sm text-gray-400 mt-4">
              Já possui conta?{' '}
              <button onClick={() => setModo('login')} className="text-blue-400 hover:underline">Entrar</button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}