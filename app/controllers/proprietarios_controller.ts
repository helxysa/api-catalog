/* eslint-disable */
import type { HttpContext } from '@adonisjs/core/http'
import Proprietario from '#models/proprietario'
import User from '#models/user'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { copyFile } from 'node:fs/promises'

export default class ResponsaveisController {
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
      
      // Montar o resultado com as URLs de logo e informações de usuário
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

      const originalProprietario = await Proprietario.findOrFail(params.id)

      const proprietarioData = originalProprietario.toJSON()

      delete proprietarioData.id
      delete proprietarioData.createdAt
      delete proprietarioData.updatedAt
      delete proprietarioData.userId 
      proprietarioData.user_id = user.id

      const clonedProprietario = await Proprietario.create(proprietarioData)

      return response.ok({
        message: 'Proprietário clonado com sucesso!',
        data: clonedProprietario,
      })
    } catch (err) {
      if (err.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Proprietário original não encontrado.' })
      }
      console.error('Error cloning proprietario:', err)
      return response.internalServerError({
        message: 'Ocorreu um erro ao clonar o proprietário.',
        error: err.message,
      })
    }
  }

  // Adicionar método para buscar proprietários por usuário
  public async getByUserId({ params, response }: HttpContext) {
    try {
      const userId = params.userId
      
      // Buscar proprietários associados ao usuário específico
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