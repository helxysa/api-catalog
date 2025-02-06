// hello-world/app/controllers/demandas_controller.ts
import Solucao from '../models/solucao.js'
import type { HttpContext } from '@adonisjs/core/http'
import HistoricoSolucao from '../models/historico_solucao.js'

export default class DemandasController {
  public async index({ response }: HttpContext) {
    try {
      const solucoes = await Solucao.query().preload('demanda').preload('tipo').preload('linguagem').preload('desenvolvedor').preload('responsavel').preload('status').preload('categoria')
      return response.ok(solucoes)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async store({ request, response, auth }: HttpContext) {
    try {
      const data = request.only([
        'demanda_id', 'nome', 'sigla', 'descricao', 'versao', 'tipo_id', 'linguagem_id', 'desenvolvedor_id', 'responsavel_id', 'status_id', 'categoria_id'
      ])
      const solucao = await Solucao.create(data)

      await HistoricoSolucao.create({
        solucao_id: solucao.id,
        usuario: auth.user?.email ?? 'sistema',
        descricao: 'Solução criada'
      })

      return response.created(solucao)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const solucao = await Solucao.query()
        .preload('demanda')
        .preload('tipo')
        .preload('linguagem')
        .preload('desenvolvedor')
        .preload('responsavel')
        .preload('status')
        .preload('categoria')
        .where('id', params.id)
        .firstOrFail()
      return response.ok(solucao)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async update({ params, request, response, auth }: HttpContext) {
    try {
      const solucao = await Solucao.findOrFail(params.id)
      const data = request.only(['nome', 'sigla', 'descricao', 'versao', 'tipo_id', 'linguagem_id', 'desenvolvedor_id', 'responsavel_id', 'status_id', 'categoria_id'])
      
      const mudancas = Object.entries(data)
        .filter(([key, value]) => solucao[key as keyof Solucao] !== value)
        .map(([key, value]) => `${key}: ${solucao[key as keyof Solucao]} -> ${value}`)
        .join(', ')


      if (mudancas) {
        await HistoricoSolucao.create({
          solucao_id: solucao.id,
          usuario: auth.user?.email ?? 'sistema', 
          descricao: `Alterações: ${mudancas}`
        })
      }

      solucao.merge(data)
      await solucao.save()
      return response.ok(solucao)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async destroy({ params, response, auth }: HttpContext) {
    try {
      const solucao = await Solucao.findOrFail(params.id)

      await HistoricoSolucao.create({
        solucao_id: solucao.id,
        usuario: auth.user?.email ?? 'sistema',
        descricao: 'Solução excluída'
      })

      await solucao.delete()
      return response.noContent()
    } catch (error) {
      return response.badRequest(error.message)
    }
  }
}