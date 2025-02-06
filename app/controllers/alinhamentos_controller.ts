import Alinhamento from '../models/alinhamento.js'
import type { HttpContext } from '@adonisjs/core/http'


export default class AlinhamentosController {
  public async index({ response }: HttpContext) {
    const alinhamentos = await Alinhamento.all()
    return response.ok(alinhamentos)
  }

  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['nome', 'descricao'])
      const alinhamento = await Alinhamento.create(data)
      return response.created(alinhamento)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const alinhamento = await Alinhamento.findOrFail(params.id)
      return response.ok(alinhamento)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const alinhamento = await Alinhamento.findOrFail(params.id)
      const data = request.only(['nome', 'descricao'])
      alinhamento.merge(data)
      await alinhamento.save()
      return response.ok(alinhamento)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      const alinhamento = await Alinhamento.findOrFail(params.id)
      await alinhamento.delete()
      return response.noContent()
    } catch (error) {
      return response.badRequest(error.message)
    }
  }
}