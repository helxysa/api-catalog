import type { HttpContext } from '@adonisjs/core/http'
import Proprietario from '#models/proprietario'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { cwd } from 'node:process'

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
    const proprietarios = await Proprietario.all()
    const proprietariosWithUrls = proprietarios.map(proprietario => ({
      ...proprietario.toJSON(),
      logo: this.getLogoUrl(proprietario.logo)
    }))
    return response.ok(proprietariosWithUrls)
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
      const formData = request.only(['nome', 'sigla', 'descricao']) as {
        nome: string
        sigla: string
        descricao?: string
      }
      
      // Create the full data object with logo
      const data: Partial<Pick<Proprietario, 'nome' | 'sigla' | 'descricao' | 'logo'>> = {
        ...formData,
        logo: logoFileName // undefined if no logo was uploaded
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
      const formData = request.only(['nome', 'sigla', 'descricao']) as {
        nome: string
        sigla: string
        descricao?: string
      }

      const data: Partial<Pick<Proprietario, 'nome' | 'sigla' | 'descricao' | 'logo'>> = {
        ...formData,
        logo: logoFileName
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
}