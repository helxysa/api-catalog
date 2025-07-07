/* eslint-disable */
import type { HttpContext } from '@adonisjs/core/http'
import Categoria from '../models/categoria.js'


export default class CategoriasController {
  public async index({ response }: HttpContext) {
    const categorias = await Categoria.all()
    return response.ok(categorias)
  }

  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['nome', 'descricao', 'proprietario_id'])
      // Validação mais detalhada
      if (!data.nome) {
        return response.badRequest('Nome é obrigatório')
      }
      if (!data.proprietario_id) {
        return response.badRequest('proprietario_id é obrigatório')
      }

      // Garantir que proprietario_id seja número
      data.proprietario_id = Number(data.proprietario_id)
      const categoria = await Categoria.create(data)
      return response.created(categoria)
    } catch (error) {
      console.error('Erro detalhado:', error) // Debug
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
      const data = request.only(['nome', 'descricao', 'proprietario_id'])
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

  public async indexByProprietario({ params, response, request }: HttpContext) {
    try {
      const page = request.input('page', 1);
      const limit = request.input('limit', 10);
      const categorias = await Categoria.query()
        .where('proprietario_id', params.proprietarioId).orderBy('id', 'asc').paginate(page, limit);
      return response.ok(categorias)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }
}