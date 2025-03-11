
import type { HttpContext } from '@adonisjs/core/http'
import Time from '#models/time'

export default class TimesController {
  public async index({ response }: HttpContext) {
    const times = await Time.all()
    return response.ok(times)
  }

  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['nome', 'funcao', 'descricao', 'proprietario_id'])
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

      const linguagem = await Time.create(data)
      return response.created(linguagem)
    } catch (error) {
      console.error('Erro detalhado:', error) // Debug
      return response.badRequest(error.message)
    }
  }


  public async show({ params, response }: HttpContext) {
    try {
      const linguagem = await Time.findOrFail(params.id)
      return response.ok(linguagem)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const linguagem = await Time.findOrFail(params.id)
      const data = request.only(['nome', 'funcao','descricao'])
      linguagem.merge(data)
      await linguagem.save()
      return response.ok(linguagem)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      const linguagem = await Time.findOrFail(params.id)
      await linguagem.delete()
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
