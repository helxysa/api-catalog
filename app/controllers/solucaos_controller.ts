// hello-world/app/controllers/demandas_controller.ts
/* eslint-disable */
import Solucao from '../models/solucao.js'
import type { HttpContext } from '@adonisjs/core/http'
import HistoricoSolucao from '../models/historico_solucao.js'
import Linguaguem from '../models/linguaguem.js'

export default class SolucoesController {
  public async index({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1);
      const limit = request.input('limit', 15);
      const demandaId = request.input('demanda_id');

      const query = Solucao.query()
        .preload('demanda')
        .preload('tipo')
        .preload('desenvolvedor')
        .preload('responsavel')
        .preload('status')
        .preload('categoria');

      if (demandaId) {
        query.where('demanda_id', demandaId);
      }

      const solucoes = await query.paginate(page, limit);

      // Se houver demanda_id, retornamos apenas o array
      if (demandaId) {
        return response.ok(solucoes.all());
      }

      // Caso contrário, retornamos o objeto de paginação completo
      return response.ok(solucoes);
    } catch (error) {
      return response.badRequest(error.message);
    }
  }

  public async store({ request, response, auth }: HttpContext) {
    try {
      const data = request.only([
        'demanda_id',
        'nome',
        'sigla',
        'descricao',
        'versao',
        'link',
        'andamento',
        'repositorio',
        'criticidade',
        'tipo_id',
        'linguagem_id',
        'desenvolvedor_id',
        'responsavel_id',
        'status_id',
        'categoria_id',
        'data_status',
        'proprietario_id'
      ])

      // Log para debug

      if (!data.data_status) {
        data.data_status = new Date().toISOString().split('T')[0];
      }

      // Garantir que o proprietario_id está presente
      if (!data.proprietario_id) {
        return response.badRequest({
          message: 'proprietario_id é obrigatório',
          error: 'Missing proprietario_id'
        })
      }

      const solucao = await Solucao.create(data)

      await HistoricoSolucao.create({
        solucao_id: solucao.id,
        usuario: auth.user?.email ?? 'sistema',
        descricao: 'Solução criada'
      })

      return response.created(solucao)
    } catch (error) {
      console.error('Error creating solution:', error);
      return response.badRequest({
        message: 'Erro ao criar solução',
        error: error.message
      })
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
      const data = request.only([
        'nome', 'sigla', 'descricao', 'versao', 'repositorio',
        'link', 'tipo_id', 'linguagem_id', 'desenvolvedor_id',
        'responsavel_id', 'status_id', 'categoria_id', 'andamento',
        'data_status', 'demanda_id', 'criticidade'  // Adicionado 'criticidade' aqui
      ])

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
      return response.badRequest({
        message: 'Erro ao atualizar solução',
        error: error.message
      })
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
        });
      }

      const solucoes = await Solucao.query()
        .where('proprietario_id', params.proprietarioId)
        .preload('demanda')
        .preload('tipo')
        .preload('desenvolvedor')
        .preload('responsavel')
        .preload('status')
        .preload('categoria');

      return response.ok(solucoes);
    } catch (error) {
      console.error('Erro ao buscar soluções por proprietário:', error);
      return response.status(500).json({
        message: 'Erro ao buscar soluções por proprietário',
        error: error.message
      });
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

  public async indexByDemanda({ request, response }: HttpContext) {
    try {
      const demandaId = request.input('demanda_id');

      if (!demandaId) {
        return response.badRequest({ message: 'demanda_id é obrigatório' });
      }

      const solucoes = await Solucao.query()
        .where('demanda_id', demandaId)
        .preload('demanda')
        .preload('tipo')
        .preload('desenvolvedor')
        .preload('responsavel')
        .preload('status')
        .preload('categoria')
        .exec();

      return response.ok(solucoes);
    } catch (error) {
      return response.badRequest(error.message);
    }
  }

  public async getAllSolucoesByProprietario({ params, response }: HttpContext) {
    try {
      const proprietarioId = params.proprietarioId;

      // Usando o ORM para buscar todas as soluções com seus relacionamentos
      const solucoes = await Solucao.query()
        .where('proprietario_id', proprietarioId)
        .preload('demanda')
        .preload('tipo')
        .preload('desenvolvedor')
        .preload('responsavel')
        .preload('status')
        .preload('categoria')
        .debug(true) // Loga a query no console
        .exec();


      // Verifica se encontrou soluções
      if (solucoes.length === 0) {
        return response.ok({
          message: 'Nenhuma solução encontrada para este proprietário',
          data: []
        });
      }

      return response.ok({
        message: 'Soluções encontradas com sucesso',
        data: solucoes
      });

    } catch (error) {
      console.error('Erro ao buscar soluções:', error);
      return response.status(500).json({
        error: 'Erro ao buscar soluções',
        details: error.message
      });
    }
  }

  public async updateSolucoesSemProprietario({ request, response, auth }: HttpContext) {
    try {
      const proprietarioId = request.input('proprietario_id');

      if (!proprietarioId) {
        return response.badRequest({ message: 'proprietario_id é obrigatório' });
      }

      // Busca e atualiza todas as soluções sem proprietário_id
      const solucoes = await Solucao.query()
        .whereNull('proprietario_id')
        .update({ proprietario_id: proprietarioId });

      return response.ok({
        message: 'Soluções atualizadas com sucesso',
        quantidade: solucoes
      });
    } catch (error) {
      console.error('Erro ao atualizar soluções:', error);
      return response.status(500).json({
        error: 'Erro ao atualizar soluções',
        details: error.message
      });
    }
  }
}
