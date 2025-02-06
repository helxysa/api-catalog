import type { HttpContext } from '@adonisjs/core/http'
import HistoricoSolucao from '../models/historico_solucao.js'

export default class HistoricoDemandasController {
  public async index({ response }: HttpContext) {
    try {
      const historicoSolucoes = await HistoricoSolucao.query().preload('solucao')
      return response.ok(historicoSolucoes)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['solucao_id', 'usuario', 'descricao'])
      const historicoSolucao = await HistoricoSolucao.create(data)
      return response.created(historicoSolucao)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const historicoSolucao = await HistoricoSolucao.query().where('id', params.id).firstOrFail()
      return response.ok(historicoSolucao)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const historicoSolucao = await HistoricoSolucao.findOrFail(params.id)
      historicoSolucao.merge(request.only(['descricao']))
      await historicoSolucao.save()
      return response.ok(historicoSolucao)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }
}
