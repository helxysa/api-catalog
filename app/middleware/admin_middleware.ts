import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Roles from '../Enums/enums.js'

/**
 * Admin middleware is used to verify if the authenticated user
 * has admin or manager privileges (roleId === 2 or roleId === 3)
 */
export default class AdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    // Primeiro verifica se o usuário está autenticado
    if (!(await ctx.auth.check())) {
      return ctx.response.unauthorized({ message: 'Não autenticado' })
    }

    // Verifica se o usuário tem roleId 2 (ADMIN) ou 3 (MANAGER)
    if (ctx.auth.user?.roleId !== Roles.ADMIN && ctx.auth.user?.roleId !== Roles.MANAGER) {
      return ctx.response.forbidden({
        message: 'Acesso negado',
        error: 'Esta ação requer privilégios de administrador ou gerente',
      })
    }

    // Se for admin ou manager, permite continuar
    return next()
  }
}
