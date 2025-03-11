// hello-world/app/controllers/demandas_controller.ts
import Solucao from '../models/solucao.js'
import type { HttpContext } from '@adonisjs/core/http'
import HistoricoSolucao from '../models/historico_solucao.js'
import Linguaguem from '../models/linguaguem.js'

export default class DemandasController {
  public async index({ response, request }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 6)
      
      const solucoes = await Solucao.query()
        .preload('demanda')
        .preload('tipo')
        .preload('desenvolvedor')
        .preload('responsavel')
        .preload('status')
        .preload('categoria')
        .paginate(page, limit)
        
      return response.ok(solucoes)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async store({ request, response, auth }: HttpContext) {
    try {
      const data = request.only([
        'demanda_id', 'nome', 'sigla', 'descricao', 'versao', 'tipo_id', 'linguagem_id', 'desenvolvedor_id', 'responsavel_id', 'status_id', 'categoria_id', 'proprietario_id'
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
        .where('id', params.id)
        .preload('demanda')
        .preload('tipo')
        .preload('desenvolvedor')
        .preload('responsavel')
        .preload('status')
        .preload('categoria')
        .firstOrFail()

      // Buscamos as linguagens
      const linguagemIds = solucao.linguagem_id 
        ? String(solucao.linguagem_id).split(',').map(id => Number(id.trim()))
        : [];

      const linguagens = await Linguaguem.query()
        .whereIn('id', linguagemIds)

      return response.ok({
        ...solucao.toJSON(),
        linguagens: linguagens,
        linguagem_ids: linguagemIds
      })

    } catch (error) {
      return response.notFound({
        message: 'Solução não encontrada',
        error: error.message
      })
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

  public async indexByProprietario({ params, response }: HttpContext) {
    try {
      if (!params.proprietarioId) {
        return response.status(400).json({
          message: 'ID do proprietário é obrigatório'
        })
      }

      // Primeiro, buscamos todas as soluções
      const solucoes = await Solucao.query()
        .where('proprietario_id', params.proprietarioId)
        .preload('demanda', (query) => {
          query.preload('proprietario')
        })
        .preload('tipo')
        .preload('desenvolvedor')
        .preload('responsavel')
        .preload('status')
        .preload('categoria')

      // Agora vamos buscar todas as linguagens uma única vez
      const todasLinguagens = await Linguaguem.query()
        .where('proprietario_id', params.proprietarioId)

      // Mapeamos as soluções para incluir as linguagens corretas
      const solucoesComLinguagens = solucoes.map(solucao => {
        // Convertemos a string de IDs em array de números
        const linguagemIds = solucao.linguagem_id 
          ? String(solucao.linguagem_id).split(',').map(id => Number(id.trim()))
          : [];

        // Filtramos as linguagens que correspondem aos IDs
        const linguagens = todasLinguagens.filter(lang => 
          linguagemIds.includes(lang.id)
        );

        // Retornamos a solução com as linguagens como um array
        return {
          ...solucao.toJSON(),
          linguagens: linguagens, // Array de objetos de linguagem
          linguagem_ids: linguagemIds // Array de IDs numéricos
        }
      })

      return response.ok({
        status: 'success',
        data: solucoesComLinguagens
      })

    } catch (error) {
      console.error('Erro ao buscar soluções por proprietário:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao buscar soluções por proprietário',
        error: error.message
      })
    }
  }

  // Novo método específico para o dashboard
  public async getAllByProprietario({ params, response }: HttpContext) {
    try {
      const proprietarioId = params.proprietarioId;
      
      // Busca todas as soluções relacionadas às demandas do proprietário
      const solucoes = await Solucao.query()
        .whereIn('demanda_id', (query) => {
          query.select('id')
            .from('demandas')
            .where('proprietario_id', proprietarioId)
        })
        .preload('demanda')
        .preload('tipo')
        .preload('desenvolvedor')
        .preload('responsavel')
        .preload('status')
        .preload('categoria')
        
      return response.ok(solucoes)
    } catch (error) {
      console.error('Erro ao buscar todas as soluções:', error)
      return response.status(500).json({
        error: 'Erro ao buscar todas as soluções',
        details: error.message
      })
    }
  }
}
