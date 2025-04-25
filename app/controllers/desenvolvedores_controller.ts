/* eslint-disable */
import type { HttpContext } from '@adonisjs/core/http'
import Desenvolvedor from '../models/desenvolvedor.js'

export default class DesenvolvedoresController {
  public async index({ response }: HttpContext) {
    const desenvolvedores = await Desenvolvedor.all()
    return response.ok(desenvolvedores)
  }

  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['nome', 'email', 'proprietario_id'])
      const desenvolvedor = await Desenvolvedor.create(data)
      return response.created(desenvolvedor)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const desenvolvedor = await Desenvolvedor.findOrFail(params.id)
      return response.ok(desenvolvedor)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const desenvolvedor = await Desenvolvedor.findOrFail(params.id)
      const data = request.only(['nome', 'email'])
      desenvolvedor.merge(data)
      await desenvolvedor.save()
      return response.ok(desenvolvedor)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      const desenvolvedor = await Desenvolvedor.findOrFail(params.id)
      await desenvolvedor.delete()
      return response.noContent()
    } catch (error) {
      return response.badRequest(error.message)
    }
  }


  public async indexByProprietario({ params, response }: HttpContext) {
    try {
      const desenvolvedores = await Desenvolvedor.query()
        .where('proprietario_id', params.proprietarioId)
      return response.ok(desenvolvedores)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }
}



