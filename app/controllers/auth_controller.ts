/* eslint-disable */
import type { HttpContext } from '@adonisjs/core/http'
import User from '../models/user.js'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  /**
   * Método para login de usuário
   */
  public async login({ request, response, auth }: HttpContext) {
    try {
      // Obter credenciais do request
      const { email, password } = request.only(['email', 'password'])


      // Verificar se o usuário existe
      const user = await User.findBy('email', email)
      if (!user) {
        return response.unauthorized({
          message: 'Credenciais inválidas',
          error: 'Usuário não encontrado'
        })
      }

      // Tentar autenticar o usuário
      try {
        // Verificar a senha manualmente
       

        try {
          const isPasswordValid = await hash.verify(user.password, password)

          if (!isPasswordValid) {
            return response.unauthorized({
              message: 'Credenciais inválidas',
              error: 'Senha incorreta'
            })
          }
        } catch (verifyError) {
          console.error('Erro ao verificar senha:', verifyError)
          return response.unauthorized({
            message: 'Credenciais inválidas',
            error: 'Erro ao verificar senha'
          })
        }

        // Fazer login com o usuário
        await auth.use('web').login(user)

        // Se a autenticação for bem-sucedida, retornar sucesso
        return response.ok({
          message: 'Login realizado com sucesso',
          user: auth.user
        })
      } catch (authError) {
        return response.unauthorized({
          message: 'Credenciais inválidas',
          error: 'Erro durante a autenticação'
        })
      }
    } catch (error) {
      console.error('Erro no processo de login:', error)
      // Se a autenticação falhar, retornar erro
      return response.unauthorized({
        message: 'Credenciais inválidas',
        error: error.message
      })
    }
  }

  /**
   * Método para registro de usuário
   */
  public async register({ request, response, auth }: HttpContext) {
    try {
      // Obter dados do request
      const userData = request.only(['fullName', 'email', 'password'])

      // Verificar se o usuário já existe
      const existingUser = await User.findBy('email', userData.email)
      if (existingUser) {
        return response.conflict({ message: 'Este email já está em uso' })
      }

      // Criar o usuário
      const user = await User.create({
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password // O hash será feito automaticamente pelo hook do modelo
      })

      // Autenticar o usuário após o registro
      await auth.use('web').login(user)

      return response.created({
        message: 'Usuário registrado com sucesso',
        user: auth.user
      })
    } catch (error) {
      return response.badRequest({
        message: 'Erro ao registrar usuário',
        error: error.message
      })
    }
  }

  /**
   * Método para logout
   */
  public async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.ok({ message: 'Logout realizado com sucesso' })
  }

  /**
   * Método para verificar se o usuário está autenticado
   */
  public async me({ auth, response }: HttpContext) {
    if (await auth.check()) {
      return response.ok({ user: auth.user })
    }
    return response.unauthorized({ message: 'Não autenticado' })
  }
}
