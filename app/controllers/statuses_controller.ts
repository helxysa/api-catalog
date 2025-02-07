
import type { HttpContext } from '@adonisjs/core/http'
import Status from '../models/status.js'

export default class LinguagensController {
  public async index({ response }: HttpContext) {
    const statuses = await Status.all()
    return response.ok(statuses)
  }

  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['nome', 'propriedade'])
      const status = await Status.create(data)
      return response.created(status)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const status = await Status.findOrFail(params.id)
      return response.ok(status)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const status = await Status.findOrFail(params.id)
      const data = request.only(['nome', 'propriedade'])
      status.merge(data)
      await status.save()
      return response.ok(status)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      const status = await Status.findOrFail(params.id)
      await status.delete()
      return response.noContent()
    } catch (error) {
      return response.badRequest(error.message)
    }
  }
}