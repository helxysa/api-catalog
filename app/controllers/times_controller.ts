import type { HttpContext } from '@adonisjs/core/http'
import Time from '#models/time'

export default class TimesController {
  public async index({ response }: HttpContext) {
    const times = await Time.all()
    return response.ok(times)
  }

  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['nome', 'funcao', 'data_inicio', 'data_fim', 'proprietario_id'])
      
      if (!data.nome) {
        return response.badRequest('Nome é obrigatório')
      }
      if (!data.proprietario_id) {
        return response.badRequest('proprietario_id é obrigatório')
      }

      data.proprietario_id = Number(data.proprietario_id)
      const time = await Time.create(data)
      return response.created(time)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const time = await Time.findOrFail(params.id)
      return response.ok(time)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const time = await Time.findOrFail(params.id)
      const data = request.only(['nome', 'funcao', 'data_inicio', 'data_fim'])
      time.merge(data)
      await time.save()
      return response.ok(time)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      const time = await Time.findOrFail(params.id)
      await time.delete()
      return response.noContent()
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async indexByProprietario({ params, response }: HttpContext) {
    try {
      const times = await Time.query()
        .where('proprietario_id', params.proprietarioId)
      return response.ok(times)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }
}

// ... código comentado removido ...