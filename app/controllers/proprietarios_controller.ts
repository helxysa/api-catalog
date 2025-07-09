/* eslint-disable */
import type { HttpContext } from '@adonisjs/core/http'
import Proprietario from '#models/proprietario'
import User from '#models/user'
import Solucao from '#models/solucao'
import Demanda from '#models/demanda'
import Status from '#models/status'
import Tipo from '#models/tipo'
import Desenvolvedor from '#models/desenvolvedor'
import Responsavel from '#models/responsavel'
import Alinhamento from '#models/alinhamento'
import Prioridade from '#models/prioridade'
import Categoria from '#models/categoria'
import Linguaguem from '#models/linguaguem'
import Time from '#models/time'
import historicoDasAtualizacoes from '#models/historico_das_atualizacoe'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { copyFile } from 'node:fs/promises'

export default class ProprietariosController { // Correção do nome da classe
  private async ensureUploadDirectory() {
    const uploadDir = join(cwd(), 'tmp', 'upload', 'logo')
    await mkdir(uploadDir, { recursive: true })
    return uploadDir
  }

  private getLogoUrl(filename: string | null) {
    if (!filename) return null
    // Using the base URL from the request to construct the full URL
    return `/tmp/upload/logo/${filename}`
  }

  public async index({ response }: HttpContext) {
    try {
      // Buscar proprietários sem usar preload
      const proprietarios = await Proprietario.all()

      // Buscar todos os usuários de uma vez (mais eficiente)
      const userIds = proprietarios.map(p => p.user_id).filter(id => id !== null)
      const users = await User.query().whereIn('id', userIds)

      // Criar um mapa de usuários por ID para fácil acesso
      const userMap: { [key: number]: User } = {}
      users.forEach(user => {
        userMap[user.id] = user
      })

      const proprietariosWithUrls = proprietarios.map(proprietario => {
        const proprietarioJson = proprietario.toJSON()
        const userId = proprietario.user_id

        return {
          ...proprietarioJson,
          logo: this.getLogoUrl(proprietario.logo),
          user: userId ? {
            id: userId,
            email: userMap[userId]?.email || '',
            fullName: userMap[userId]?.fullName || ''
          } : null
        }
      })

      return response.ok(proprietariosWithUrls)
    } catch (error) {
      console.error('Erro ao buscar proprietários:', error)
      return response.internalServerError({ error: 'Erro ao buscar proprietários' })
    }
  }

  public async store({ request, response }: HttpContext) {
    try {
      // Handle the logo file upload
      const logo = request.file('logo')
      let logoFileName: string | undefined = undefined

      if (logo) {
        // Ensure upload directory exists
        const uploadDir = await this.ensureUploadDirectory()

        // Generate unique filename using timestamp
        logoFileName = `${Date.now()}-${logo.clientName}`

        // Move the uploaded file to our upload directory
        await logo.move(uploadDir, {
          name: logoFileName,
        })
      }

      // Get other form data with proper typing
      const formData = request.only(['nome', 'sigla', 'descricao', 'user_id']) as {
        nome: string
        sigla: string
        descricao?: string
        user_id?: number
      }

      // Create the full data object with logo
      const data: Partial<Pick<Proprietario, 'nome' | 'sigla' | 'descricao' | 'logo' | 'user_id'>> = {
        ...formData,
        logo: logoFileName, // undefined if no logo was uploaded
        user_id: formData.user_id ? Number(formData.user_id) : null
      }

      const proprietario = await Proprietario.create(data)
      return response.created({
        ...proprietario.toJSON(),
        logo: this.getLogoUrl(proprietario.logo)
      })
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const proprietario = await Proprietario.findOrFail(params.id)
      return response.ok({
        ...proprietario.toJSON(),
        logo: this.getLogoUrl(proprietario.logo)
      })
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const proprietario = await Proprietario.findOrFail(params.id)

      // Handle logo file update if provided
      const logo = request.file('logo')
      let logoFileName: string | undefined = proprietario.logo // Keep existing logo if no new file

      if (logo) {
        // Ensure upload directory exists
        const uploadDir = await this.ensureUploadDirectory()

        // Generate unique filename using timestamp
        logoFileName = `${Date.now()}-${logo.clientName}`

        // Move the uploaded file to our upload directory
        await logo.move(uploadDir, {
          name: logoFileName,
        })
      }

      // Get other form data and create update object
      const formData = request.only(['nome', 'sigla', 'descricao', 'user_id']) as {
        nome: string
        sigla: string
        descricao?: string
        user_id?: number
      }

      const data: Partial<Pick<Proprietario, 'nome' | 'sigla' | 'descricao' | 'logo' | 'user_id'>> = {
        ...formData,
        logo: logoFileName,
        user_id: formData.user_id ? Number(formData.user_id) : proprietario.user_id
      }

      proprietario.merge(data)
      await proprietario.save()

      return response.ok({
        ...proprietario.toJSON(),
        logo: this.getLogoUrl(proprietario.logo)
      })
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      const proprietario = await Proprietario.findOrFail(params.id)
      await proprietario.delete()
      return response.noContent()
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  public async clone({ params, response, auth }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!

      const originalProprietarioId = params.id
      const originalProprietario = await Proprietario.findOrFail(originalProprietarioId)

      console.log(`=== INICIANDO CLONAGEM DO PROPRIETÁRIO ${originalProprietarioId} ===`)

      // 1. Clonar o proprietário básico COM O MESMO USER_ID
      const proprietarioData = originalProprietario.toJSON()
      delete proprietarioData.id
      delete proprietarioData.createdAt
      delete proprietarioData.updatedAt
      delete proprietarioData.userId
      // Manter o mesmo user_id (mesmo dono)
      proprietarioData.user_id = originalProprietario.user_id  // ← MESMA PESSOA
      proprietarioData.nome = `${proprietarioData.nome} (Cópia)`
      proprietarioData.sigla = `${proprietarioData.sigla}_copia`

      console.log('📋 Dados do proprietário antes da criação:', proprietarioData)

      const clonedProprietario = await Proprietario.create(proprietarioData)
      const novoProprietarioId = clonedProprietario.id

      console.log(`✅ Nova unidade criada:`)
      console.log(`   Original ID: ${originalProprietarioId}`)
      console.log(`   Nova unidade ID: ${novoProprietarioId}`)
      console.log(`   Mesmo dono (user_id): ${originalProprietario.user_id}`)

      // Verificar se o ID é válido
      if (!novoProprietarioId || isNaN(novoProprietarioId)) {
        throw new Error(`ID da nova unidade é inválido: ${novoProprietarioId}`)
      }

      // 2. Clonar Status
      const statusOriginal = await Status.query().where('proprietario_id', originalProprietarioId)
      const statusMap: { [key: number]: number } = {}
      console.log(`Encontrados ${statusOriginal.length} status para clonar`)

      for (const status of statusOriginal) {
        try {
          const statusData = {
            nome: status.nome,
            propriedade: status.propriedade,
            proprietario_id: novoProprietarioId
          }

          const novoStatus = await Status.create(statusData)
          statusMap[status.id] = novoStatus.id
        } catch (error) {
          console.error(`Erro ao clonar status ${status.id}:`, error)
        }
      }

      // 3. Clonar Tipos
      const tiposOriginal = await Tipo.query().where('proprietario_id', originalProprietarioId)
      const tiposMap: { [key: number]: number } = {}
      console.log(`Encontrados ${tiposOriginal.length} tipos para clonar`)

      for (const tipo of tiposOriginal) {
        try {
          const tipoData = {
            nome: tipo.nome,
            descricao: tipo.descricao,
            proprietario_id: novoProprietarioId
          }

          const novoTipo = await Tipo.create(tipoData)
          tiposMap[tipo.id] = novoTipo.id
        } catch (error) {
          console.error(`Erro ao clonar tipo ${tipo.id}:`, error)
        }
      }

      // 4. Clonar Desenvolvedores
      const desenvolvedoresOriginal = await Desenvolvedor.query().where('proprietario_id', originalProprietarioId)
      const desenvolvedoresMap: { [key: number]: number } = {}
      console.log(`Encontrados ${desenvolvedoresOriginal.length} desenvolvedores para clonar`)

      for (const dev of desenvolvedoresOriginal) {
        try {
          const devData = {
            nome: dev.nome,
            email: dev.email,
            proprietario_id: novoProprietarioId
          }

          const novoDev = await Desenvolvedor.create(devData)
          desenvolvedoresMap[dev.id] = novoDev.id
        } catch (error) {
          console.error(`Erro ao clonar desenvolvedor ${dev.id}:`, error)
        }
      }

      // 5. Clonar Responsáveis
      const responsaveisOriginal = await Responsavel.query().where('proprietario_id', originalProprietarioId)
      const responsaveisMap: { [key: number]: number } = {}
      console.log(`Encontrados ${responsaveisOriginal.length} responsáveis para clonar`)

      for (const resp of responsaveisOriginal) {
        try {
          const respData = {
            nome: resp.nome,
            email: resp.email,
            proprietario_id: novoProprietarioId
          }

          const novoResp = await Responsavel.create(respData)
          responsaveisMap[resp.id] = novoResp.id
        } catch (error) {
          console.error(`Erro ao clonar responsável ${resp.id}:`, error)
        }
      }

      // 6. Clonar Alinhamentos
      const alinhamentosOriginal = await Alinhamento.query().where('proprietario_id', originalProprietarioId)
      const alinhamentosMap: { [key: number]: number } = {}
      console.log(`Encontrados ${alinhamentosOriginal.length} alinhamentos para clonar`)

      for (const alin of alinhamentosOriginal) {
        try {
          const alinData = {
            nome: alin.nome,
            descricao: alin.descricao,
            proprietario_id: novoProprietarioId
          }

          const novoAlin = await Alinhamento.create(alinData)
          alinhamentosMap[alin.id] = novoAlin.id
        } catch (error) {
          console.error(`Erro ao clonar alinhamento ${alin.id}:`, error)
        }
      }

      // 7. Clonar Prioridades
      const prioridadesOriginal = await Prioridade.query().where('proprietario_id', originalProprietarioId)
      const prioridadesMap: { [key: number]: number } = {}
      console.log(`Encontradas ${prioridadesOriginal.length} prioridades para clonar`)

      for (const prio of prioridadesOriginal) {
        try {
          const prioData = {
            nome: prio.nome,
            descricao: prio.descricao,
            proprietario_id: novoProprietarioId
          }

          const novaPrio = await Prioridade.create(prioData)
          prioridadesMap[prio.id] = novaPrio.id
        } catch (error) {
          console.error(`Erro ao clonar prioridade ${prio.id}:`, error)
        }
      }

      // 8. Clonar Categorias
      const categoriasOriginal = await Categoria.query().where('proprietario_id', originalProprietarioId)
      const categoriasMap: { [key: number]: number } = {}
      console.log(`Encontradas ${categoriasOriginal.length} categorias para clonar`)

      for (const cat of categoriasOriginal) {
        try {
          const catData = {
            nome: cat.nome,
            descricao: cat.descricao,
            proprietario_id: novoProprietarioId
          }

          const novaCat = await Categoria.create(catData)
          categoriasMap[cat.id] = novaCat.id
        } catch (error) {
          console.error(`Erro ao clonar categoria ${cat.id}:`, error)
        }
      }

      // 9. Clonar Linguagens
      const linguagensOriginal = await Linguaguem.query().where('proprietario_id', originalProprietarioId)
      const linguagensMap: { [key: number]: number } = {}
      console.log(`Encontradas ${linguagensOriginal.length} linguagens para clonar`)

      for (const ling of linguagensOriginal) {
        try {
          const lingData = {
            nome: ling.nome,
            descricao: ling.descricao,
            proprietario_id: novoProprietarioId
          }

          const novaLing = await Linguaguem.create(lingData)
          linguagensMap[ling.id] = novaLing.id
        } catch (error) {
          console.error(`Erro ao clonar linguagem ${ling.id}:`, error)
        }
      }

      // 10. Clonar Demandas
      const demandasOriginal = await Demanda.query().where('proprietario_id', originalProprietarioId)
      const demandasMap: { [key: number]: number } = {}
      console.log(`📋 Encontradas ${demandasOriginal.length} demandas para clonar`)

      for (const demanda of demandasOriginal) {
        try {
          const demandaData = {
            nome: demanda.nome,
            sigla: demanda.sigla,
            descricao: demanda.descricao,
            demandante: demanda.demandante,
            fator_gerador: demanda.fator_gerador,
            link: demanda.link,
            data_status: demanda.data_status,
            proprietario_id: novoProprietarioId,
            alinhamento_id: demanda.alinhamento_id && alinhamentosMap[demanda.alinhamento_id]
              ? alinhamentosMap[demanda.alinhamento_id]
              : undefined,
            prioridade_id: demanda.prioridade_id && prioridadesMap[demanda.prioridade_id]
              ? prioridadesMap[demanda.prioridade_id]
              : undefined,
            responsavel_id: demanda.responsavel_id && responsaveisMap[demanda.responsavel_id]
              ? responsaveisMap[demanda.responsavel_id]
              : undefined,
            status_id: demanda.status_id && statusMap[demanda.status_id]
              ? statusMap[demanda.status_id]
              : undefined,
          }

          console.log(`📋 Clonando demanda: ${demanda.nome}`)
          console.log(`   Para a nova unidade proprietario_id: ${novoProprietarioId}`)

          const novaDemanda = await Demanda.create(demandaData)
          demandasMap[demanda.id] = novaDemanda.id

          console.log(`✅ Demanda clonada: ${demanda.id} -> ${novaDemanda.id}`)
        } catch (error) {
          console.error(`❌ Erro ao clonar demanda ${demanda.id}:`, error)
        }
      }

      // 11. Clonar Soluções
      const solucoesOriginais = await Solucao.query().where('proprietario_id', originalProprietarioId)
      console.log(`🔧 Encontradas ${solucoesOriginais.length} soluções para clonar`)

      for (const solucao of solucoesOriginais) {
        try {
          const novaDemandaId = solucao.demanda_id && demandasMap[solucao.demanda_id]
            ? demandasMap[solucao.demanda_id]
            : null

          // Função auxiliar para limpar e validar JSON
          const cleanJsonField = (jsonData: any): any => {
            if (!jsonData) return null

            try {
              let parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData

              const cleanObject = (obj: any): any => {
                if (Array.isArray(obj)) {
                  return obj.map(cleanObject)
                } else if (typeof obj === 'object' && obj !== null) {
                  const cleaned: any = {}
                  for (const [key, value] of Object.entries(obj)) {
                    if (value === '' || value === null || value === undefined) {
                      cleaned[key] = null
                    } else if (typeof value === 'object') {
                      cleaned[key] = cleanObject(value)
                    } else {
                      cleaned[key] = value
                    }
                  }
                  return cleaned
                }
                return obj === '' ? null : obj
              }

              return cleanObject(parsed)
            } catch (error) {
              console.warn(`⚠️ Erro ao processar JSON, usando null:`, error)
              return null
            }
          }

          const solucaoData = {
            nome: solucao.nome,
            sigla: solucao.sigla,
            descricao: solucao.descricao,
            versao: solucao.versao,
            repositorio: solucao.repositorio,
            link: solucao.link,
            andamento: solucao.andamento,
            criticidade: solucao.criticidade,
            data_status: solucao.data_status,
            times: cleanJsonField(solucao.times),
            atualizacoes: cleanJsonField(solucao.atualizacoes),
            proprietario_id: novoProprietarioId,
            demanda_id: novaDemandaId || undefined,
            tipo_id: solucao.tipo_id && tiposMap[solucao.tipo_id]
              ? tiposMap[solucao.tipo_id]
              : undefined,
            linguagem_id: solucao.linguagem_id && linguagensMap[solucao.linguagem_id]
              ? linguagensMap[solucao.linguagem_id]
              : undefined,
            desenvolvedor_id: solucao.desenvolvedor_id && desenvolvedoresMap[solucao.desenvolvedor_id]
              ? desenvolvedoresMap[solucao.desenvolvedor_id]
              : undefined,
            categoria_id: solucao.categoria_id && categoriasMap[solucao.categoria_id]
              ? categoriasMap[solucao.categoria_id]
              : undefined,
            responsavel_id: solucao.responsavel_id && responsaveisMap[solucao.responsavel_id]
              ? responsaveisMap[solucao.responsavel_id]
              : undefined,
            status_id: solucao.status_id && statusMap[solucao.status_id]
              ? statusMap[solucao.status_id]
              : undefined,
          }

          console.log(`🔧 Clonando solução: ${solucao.nome}`)
          console.log(`   Para nova unidade: demanda_id=${novaDemandaId}, proprietario_id=${novoProprietarioId}`)

          const novaSolucao = await Solucao.create(solucaoData)
          console.log(`✅ Solução clonada: ${solucao.id} -> ${novaSolucao.id}`)

        } catch (error) {
          console.error(`❌ Erro ao clonar solução ${solucao.id}:`, error)
        }
      }

      console.log('🎉 Nova unidade criada com sucesso!')

      // Verificação final
      const novasDemandas = await Demanda.query().where('proprietario_id', novoProprietarioId)
      const novasSolucoes = await Solucao.query().where('proprietario_id', novoProprietarioId)

      console.log(`📊 Verificação final da nova unidade:`)
      console.log(`   Demandas criadas: ${novasDemandas.length}`)
      console.log(`   Soluções criadas: ${novasSolucoes.length}`)

      return response.ok({
        message: 'Nova unidade criada com todas as entidades clonadas com sucesso!',
        data: clonedProprietario,
        summary: {
          status: statusOriginal.length,
          tipos: tiposOriginal.length,
          desenvolvedores: desenvolvedoresOriginal.length,
          responsaveis: responsaveisOriginal.length,
          alinhamentos: alinhamentosOriginal.length,
          prioridades: prioridadesOriginal.length,
          categorias: categoriasOriginal.length,
          linguagens: linguagensOriginal.length,
          demandas: demandasOriginal.length,
          solucoes: solucoesOriginais.length
        }
      })
    } catch (err) {
      console.error('❌ ERRO GERAL NA CLONAGEM:', err)
      return response.internalServerError({
        message: 'Ocorreu um erro ao criar a nova unidade.',
        error: err.message,
      })
    }
  }

  public async getByUserId({ params, response }: HttpContext) {
    try {
      const userId = params.userId

      const proprietarios = await Proprietario.query()
        .where('user_id', userId)

      return response.ok(proprietarios)
    } catch (error) {
      return response.badRequest({
        message: 'Erro ao buscar proprietários do usuário',
        error: error.message
      })
    }
  }
}