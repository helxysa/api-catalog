/* eslint-disable */
import type { HttpContext } from '@adonisjs/core/http'
import User from '../models/user.js'
import hash from '@adonisjs/core/services/hash'
import Roles from '../Enums/enums.js'

export default class AuthController {
  /**
   * Método para login de usuário
   */
  public async login({ request, response, auth }: HttpContext) {
    try {
      const { email, password } = request.only(['email', 'password'])


      const user = await User.findBy('email', email)
      if (!user) {
        return response.unauthorized({
          message: 'Credenciais inválidas',
          error: 'Usuário não encontrado'
        })
      }

      try {
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
   * Disponível apenas para usuários admin (ID 1)
   */
  public async register({ request, response, auth }: HttpContext) {
    try {
      if (!await auth.check()) {
        return response.unauthorized({ message: 'Não autenticado' })
      }

      if (auth.user?.roleId !== Roles.ADMIN) {
        return response.forbidden({ 
          message: 'Acesso negado', 
          error: 'Apenas administradores podem registrar novos usuários' 
        })
      }

      const userData = request.only(['fullName', 'email', 'password', 'roleId'])

      const existingUser = await User.findBy('email', userData.email)
      if (existingUser) {
        return response.conflict({ message: 'Este email já está em uso' })
      }

      // Criar o usuário
      const user = await User.create({
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password, // O hash será feito automaticamente pelo hook do modelo
        roleId: userData.roleId || Roles.USER // Usar o roleId fornecido ou o padrão USER
      })

      return response.created({
        message: 'Usuário registrado com sucesso',
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          roleId: user.roleId
        }
      })
    } catch (error) {
      return response.badRequest({
        message: 'Erro ao registrar usuário',
        error: error.message
      })
    }
  }

  /**
   * Método para listar todos os usuários
   * Disponível apenas para usuários admin (ID 1)
   */
  public async listUsers({ response, auth }: HttpContext) {
    try {
      // Verificar se o usuário está autenticado
      if (!await auth.check()) {
        return response.unauthorized({ message: 'Não autenticado' })
      }

      // Verificar se o usuário autenticado é admin (roleId 2)
      if (auth.user?.roleId !== Roles.ADMIN) {
        return response.forbidden({ 
          message: 'Acesso negado', 
          error: 'Apenas administradores podem listar usuários' 
        })
      }

      // Buscar todos os usuários
      const users = await User.all()
      
      // Retornar a lista de usuários sem as senhas
      const safeUsers = users.map(user => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        roleId: user.roleId, // Adicionando o roleId
        createdAt: user.createdAt
      }))

      return response.ok(safeUsers)
    } catch (error) {
      return response.badRequest({
        message: 'Erro ao listar usuários',
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

  /**
   * Método para atualizar um usuário
   * Disponível apenas para usuários admin (ID 2)
   */
  public async updateUser({ request, response, auth }: HttpContext) {
    try {
      if (!await auth.check()) {
        return response.unauthorized({ message: 'Não autenticado' })
      }

      if (auth.user?.roleId !== Roles.ADMIN) {
        return response.forbidden({ 
          message: 'Acesso negado', 
          error: 'Apenas administradores podem atualizar usuários' 
        })
      }

      const userData = request.only(['id', 'fullName', 'email', 'password', 'roleId'])
      
      // Verificar se o usuário existe
      const user = await User.find(userData.id)
      if (!user) {
        return response.notFound({ message: 'Usuário não encontrado' })
      }

      // Verificar se o email já está em uso por outro usuário
      if (userData.email !== user.email) {
        const existingUser = await User.findBy('email', userData.email)
        if (existingUser && existingUser.id !== user.id) {
          return response.conflict({ message: 'Este email já está em uso por outro usuário' })
        }
      }

      // Atualizar os dados do usuário
      user.fullName = userData.fullName
      user.email = userData.email
      
      // Atualizar a senha apenas se fornecida
      if (userData.password && userData.password.trim() !== '') {
        user.password = userData.password
      }
      
      // Atualizar o roleId se fornecido
      if (userData.roleId) {
        user.roleId = userData.roleId
      }

      await user.save()

      return response.ok({
        message: 'Usuário atualizado com sucesso',
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          roleId: user.roleId
        }
      })
    } catch (error) {
      return response.badRequest({
        message: 'Erro ao atualizar usuário',
        error: error.message
      })
    }
  }

  /**
   * Método para excluir um usuário
   * Disponível apenas para usuários admin (ID 2)
   */
  public async deleteUser({ params, response, auth }: HttpContext) {
    try {
      if (!await auth.check()) {
        return response.unauthorized({ message: 'Não autenticado' })
      }

      if (auth.user?.roleId !== Roles.ADMIN) {
        return response.forbidden({ 
          message: 'Acesso negado', 
          error: 'Apenas administradores podem excluir usuários' 
        })
      }

      const userId = params.id
      
      // Verificar se o usuário existe
      const user = await User.find(userId)
      if (!user) {
        return response.notFound({ message: 'Usuário não encontrado' })
      }

      // Impedir a exclusão do próprio usuário administrador
      if (user.id === auth.user.id) {
        return response.forbidden({ 
          message: 'Operação não permitida', 
          error: 'Você não pode excluir sua própria conta' 
        })
      }

      // Excluir o usuário
      await user.delete()

      return response.ok({
        message: 'Usuário excluído com sucesso'
      })
    } catch (error) {
      return response.badRequest({
        message: 'Erro ao excluir usuário',
        error: error.message
      })
    }
  }
}



