
import type { HttpContext } from '@adonisjs/core/http'
import Prioridade from '../models/prioridade.js'

export default class PrioridadesController {
  public async index({ response }: HttpContext) {
    const prioridades = await Prioridade.all()
    return response.ok(prioridades)
  }

  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['nome', 'descricao', 'proprietario_id'])
      console.log('Dados recebidos no backend:', data) // Debug
      
      // Validação mais detalhada
      if (!data.nome) {
        return response.badRequest('Nome é obrigatório')
      }
      
      if (!data.proprietario_id) {
        return response.badRequest('proprietario_id é obrigatório')
      }

      // Garantir que proprietario_id seja número
      data.proprietario_id = Number(data.proprietario_id)
      console.log('Dados após conversão:', data) // Debug

      const prioridade = await Prioridade.create(data)
      return response.created(prioridade)
    } catch (error) {
      console.error('Erro detalhado:', error) // Debug
      return response.badRequest(error.message)
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const prioridade = await Prioridade.findOrFail(params.id)
      return response.ok(prioridade)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const prioridade = await Prioridade.findOrFail(params.id)
      const data = request.only(['nome', 'descricao'])
      prioridade.merge(data)
      await prioridade.save()
      return response.ok(prioridade)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      const prioridade = await Prioridade.findOrFail(params.id)
      await prioridade.delete()
      return response.noContent()
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async indexByProprietario({ params, response }: HttpContext) {
    try {
      const prioridades = await Prioridade.query()
        .where('proprietario_id', params.proprietarioId)
      return response.ok(prioridades)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }
}