import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Admin middleware is used to verify if the authenticated user
 * has admin privileges (roleId === 2)
 */
export default class AdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    // Primeiro verifica se o usuário está autenticado
    if (!(await ctx.auth.check())) {
      return ctx.response.unauthorized({ message: 'Não autenticado' })
    }

    // Verifica se o usuário tem roleId 2 (ADMIN)
    if (ctx.auth.user?.roleId !== 2) {
      return ctx.response.forbidden({
        message: 'Acesso negado',
        error: 'Esta ação requer privilégios de administrador',
      })
    }

    // Se for admin, permite continuar
    return next()
  }
}
