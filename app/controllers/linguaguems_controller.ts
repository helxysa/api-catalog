
import type { HttpContext } from '@adonisjs/core/http'
import Linguaguem from '../models/linguaguem.js'

export default class LinguagensController {
  public async index({ response }: HttpContext) {
    const linguagens = await Linguaguem.all()
    return response.ok(linguagens)
  }

  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['nome', 'descricao'])
      const linguagem = await Linguaguem.create(data)
      return response.created(linguagem)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const linguagem = await Linguaguem.findOrFail(params.id)
      return response.ok(linguagem)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const linguagem = await Linguaguem.findOrFail(params.id)
      const data = request.only(['nome', 'descricao'])
      linguagem.merge(data)
      await linguagem.save()
      return response.ok(linguagem)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      const linguagem = await Linguaguem.findOrFail(params.id)
      await linguagem.delete()
      return response.noContent()
    } catch (error) {
      return response.badRequest(error.message)
    }
  }
}