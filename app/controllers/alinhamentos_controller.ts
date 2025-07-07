/* eslint-disable */
import Alinhamento from '../models/alinhamento.js'
import type { HttpContext } from '@adonisjs/core/http'


export default class AlinhamentosController {
  public async index({ response }: HttpContext) {
    const alinhamentos = await Alinhamento.all()
    return response.ok(alinhamentos)
  }

  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['nome', 'descricao', 'proprietario_id'])
      
      if (!data.nome) {
        return response.badRequest('Nome é obrigatório')
      }
      
      if (!data.proprietario_id) {
        return response.badRequest('proprietario_id é obrigatório')
      }

      // Garantir que proprietario_id seja número
      data.proprietario_id = Number(data.proprietario_id)
       // Debug

      const alinhamento = await Alinhamento.create(data)
      return response.created(alinhamento)
    } catch (error) {
      console.error('Erro detalhado:', error) // Debug
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


  public async indexByProprietario({ params, response, request }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 15)
      
      const alinhamentos = await Alinhamento.query()
        .where('proprietario_id', params.proprietarioId).orderBy('id', 'asc').paginate(page, limit);
      return response.ok(alinhamentos)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }
}




