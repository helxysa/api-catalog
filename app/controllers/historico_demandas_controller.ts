/* eslint-disable */
import type { HttpContext } from '@adonisjs/core/http'
import HistoricoDemanda from '../models/historico_demanda.js'

export default class HistoricoDemandasController {
  public async index({ response }: HttpContext) {
    try {
      const historicoDemandas = await HistoricoDemanda.query().preload('demanda').preload('proprietario')
      return response.ok(historicoDemandas)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['demanda_id', 'usuario', 'descricao', 'proprietario_id'])
      const historicoDemanda = await HistoricoDemanda.create(data)
      return response.created(historicoDemanda)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const historicoDemanda = await HistoricoDemanda.query().where('id', params.id).firstOrFail()
      return response.ok(historicoDemanda)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const historicoDemanda = await HistoricoDemanda.findOrFail(params.id)
      historicoDemanda.merge(request.only(['descricao']))
      await historicoDemanda.save()
      return response.ok(historicoDemanda)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async indexByProprietario({ params, response }: HttpContext) {
    try {
      const historicoDemandas = await HistoricoDemanda.query().where('proprietario_id', params.proprietarioId)
      return response.ok(historicoDemandas)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async indexByDemanda({ params, response }: HttpContext) {
    try {
      const historicos = await HistoricoDemanda.query()
        .where('demanda_id', params.demandaId)
        .orderBy('created_at', 'desc')
      return response.ok(historicos)
    } catch (error) {
      return response.badRequest({ message: 'Erro ao buscar histórico da demanda', error: error.message })
    }
  }
}
