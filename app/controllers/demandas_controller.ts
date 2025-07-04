/* eslint-disable */
import Demanda from '../models/demanda.js'
import type { HttpContext } from '@adonisjs/core/http'
import HistoricoDemanda from '../models/historico_demanda.js'

export default class DemandasController {
  public async index({ response, request, params }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 15)
      const proprietarioId = params.id

      const query = Demanda.query()

      if (proprietarioId) {
        query.where('proprietario_id', proprietarioId)
      }

      const demandas = await query
        .preload('proprietario')
        .preload('alinhamento')
        .preload('prioridade')
        .preload('responsavel')
        .preload('status')
        .orderBy('id', 'asc')
        .paginate(page, limit)

      return response.ok(demandas)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }


  public async demandasAll({ response }: HttpContext) {
    try {
      const query = Demanda.query()

      const demandas = await query
        .preload('proprietario')
        .preload('alinhamento')
        .preload('prioridade')
        .preload('responsavel')
        .preload('status')
        .orderBy('id', 'asc')

      return response.ok(demandas)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async store({ request, response, auth }: HttpContext) {
    try {
      const data = request.only([
        'proprietario_id', 'nome', 'sigla', 'descricao', 'demandante', 'fator_gerador',
        'alinhamento_id', 'prioridade_id', 'responsavel_id', 'status_id', 'data_status', 'link'
      ]);
      const demanda = await Demanda.create(data);

      await HistoricoDemanda.create({
        demanda_id: demanda.id,
        usuario: auth.user?.email ?? 'sistema',
        descricao: 'Demanda criada'
      })

      return response.created(demanda)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const demanda = await Demanda.query()
        .preload('proprietario')
        .preload('alinhamento')
        .preload('prioridade')
        .preload('responsavel')
        .preload('status')
        .where('id', params.id)
        .firstOrFail()
      return response.ok(demanda)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async update({ params, request, response, auth }: HttpContext) {
    try {
      const demanda = await Demanda.findOrFail(params.id)
      const data = request.only([
        'nome', 'sigla', 'descricao', 'demandante', 'fator_gerador', 
        'alinhamento_id', 'prioridade_id', 'responsavel_id', 
        'status_id', 'data_status', 'link'  // Adicionado o campo link
      ])

      const mudancas = Object.entries(data)
        .filter(([key, value]) => demanda[key as keyof Demanda] !== value)
        .map(([key, value]) => `${key}: ${demanda[key as keyof Demanda]} -> ${value}`)
        .join(', ')


      if (mudancas) {
        await HistoricoDemanda.create({
          demanda_id: demanda.id,
          usuario: auth.user?.email ?? 'sistema',
          descricao: `Alterações: ${mudancas}`
        })
      }

      demanda.merge(data)
      await demanda.save()
      return response.ok(demanda)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async destroy({ params, response, auth }: HttpContext) {
    try {
      const demanda = await Demanda.findOrFail(params.id)

      await HistoricoDemanda.create({
        demanda_id: demanda.id,
        usuario: auth.user?.email ?? 'sistema',
        descricao: 'Demanda excluída'
      })

      await demanda.delete()
      return response.noContent()
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async indexByProprietario({ params, response }: HttpContext) {
    try {
      const demandas = await Demanda.query().where('proprietario_id', params.proprietarioId)
      return response.ok(demandas)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async all({ response }: HttpContext) {
    try {
      const demandas = await Demanda.query()
        .preload('proprietario')
        .preload('alinhamento')
        .preload('prioridade')
        .preload('responsavel')
        .preload('status')
        .orderBy('created_at', 'desc')

      return response.ok(demandas)
    } catch (error) {
      console.error('Error in all demandas:', error)
      return response.status(500).json({
        error: 'Erro ao buscar todas as demandas',
        details: error.message
      })
    }
  }

  public async getAllByProprietario({ params, response }: HttpContext) {
    try {
      const proprietarioId = params.proprietarioId;

      const demandas = await Demanda.query()
        .where('proprietario_id', proprietarioId)
        .preload('proprietario')
        .preload('alinhamento')
        .preload('prioridade')
        .preload('responsavel')
        .preload('status')

      return response.ok(demandas)
    } catch (error) {
      console.error('Erro ao buscar todas as demandas:', error)
      return response.status(500).json({
        error: 'Erro ao buscar todas as demandas',
        details: error.message
      })
    }
  }
}
