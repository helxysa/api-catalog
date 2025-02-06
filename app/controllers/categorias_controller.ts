
import type { HttpContext } from '@adonisjs/core/http'
import Categoria from '../models/categoria.js'

export default class CategoriasController {
  public async index({ response }: HttpContext) {
    const categorias = await Categoria.all()
    return response.ok(categorias)
  }

  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['nome', 'descricao'])
      const categoria = await Categoria.create(data)
      return response.created(categoria)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const categoria = await Categoria.findOrFail(params.id)
      return response.ok(categoria)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const categoria = await Categoria.findOrFail(params.id)
      const data = request.only(['nome', 'descricao'])
      categoria.merge(data)
      await categoria.save()
      return response.ok(categoria)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      const categoria = await Categoria.findOrFail(params.id)
      await categoria.delete()
      return response.noContent()
    } catch (error) {
      return response.badRequest(error.message)
    }
  }
}