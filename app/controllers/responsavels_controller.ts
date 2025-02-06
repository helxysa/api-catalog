
import type { HttpContext } from '@adonisjs/core/http'
import Responsavel from '../models/responsavel.js'

export default class ResponsaveisController {
  public async index({ response }: HttpContext) {
    const responsaveis = await Responsavel.all()
    return response.ok(responsaveis)
  }

  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['nome', 'email'])
      const responsavel = await Responsavel.create(data)
      return response.created(responsavel)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const responsavel = await Responsavel.findOrFail(params.id)
      return response.ok(responsavel)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const responsavel = await Responsavel.findOrFail(params.id)
      const data = request.only(['nome', 'email'])
      responsavel.merge(data)
      await responsavel.save()
      return response.ok(responsavel)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      const responsavel = await Responsavel.findOrFail(params.id)
      await responsavel.delete()
      return response.noContent()
    } catch (error) {
      return response.badRequest(error.message)
    }
  }
}