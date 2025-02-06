
import type { HttpContext } from '@adonisjs/core/http'
import Proprietario from '#models/proprietario'

export default class ResponsaveisController {
  public async index({ response }: HttpContext) {
    const proprietario = await Proprietario.all()
    return response.ok(proprietario)
  }

  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['nome', 'sigla', 'descricao', 'logo'])
      const proprietario = await Proprietario.create(data)
      return response.created(proprietario)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const proprietario = await Proprietario.findOrFail(params.id)
      return response.ok(proprietario)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const proprietario = await Proprietario.findOrFail(params.id)
      const data = request.only(['nome', 'email'])
      proprietario.merge(data)
      await proprietario.save()
      return response.ok(proprietario)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      const proprietario = await Proprietario.findOrFail(params.id)
      await proprietario.delete()
      return response.noContent()
    } catch (error) {
      return response.badRequest(error.message)
    }
  }
}