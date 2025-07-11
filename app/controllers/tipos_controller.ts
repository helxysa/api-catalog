/* eslint-disable */
import type { HttpContext } from '@adonisjs/core/http'
import Tipo from '../models/tipo.js'  

export default class LinguagensController {
  public async index({ response }: HttpContext) {
    const tipos = await Tipo.all()
    return response.ok(tipos)
  }

  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['nome', 'descricao', 'proprietario_id'])
      const tipo = await Tipo.create(data)
      return response.created(tipo)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const tipo = await Tipo.findOrFail(params.id)
      return response.ok(tipo)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const tipo = await Tipo.findOrFail(params.id)
      const data = request.only(['nome', 'descricao'])
      tipo.merge(data)
      await tipo.save()
      return response.ok(tipo)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      const tipo = await Tipo.findOrFail(params.id)
      await tipo.delete()
      return response.noContent()
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async indexByProprietario({ params, response, request }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 15)
      const tipos = await Tipo.query()
        .where('proprietario_id', params.proprietarioId).orderBy('id', 'asc').paginate(page, limit)
      return response.ok(tipos)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }
}