/* eslint-disable */
import type { HttpContext } from '@adonisjs/core/http'
import Proprietario from '#models/proprietario'
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

  public async clone({ params, response }: HttpContext) {
    try {
      // Encontrar o proprietário original
      const originalProprietario = await Proprietario.findOrFail(params.id)
      
      // Criar novo nome e sigla para o clone
      const newNome = `${originalProprietario.nome} (Cópia)`
      const newSigla = `${originalProprietario.sigla}_COPY`

      // Preparar o novo logo se existir
      let newLogoFileName: string | undefined = undefined
      if (originalProprietario.logo) {
        const uploadDir = await this.ensureUploadDirectory()
        newLogoFileName = `copy-${Date.now()}-${originalProprietario.logo}`
        
        // Copiar o arquivo de logo
        try {
          await copyFile(
            join(cwd(), 'tmp', 'upload', 'logo', originalProprietario.logo),
            join(uploadDir, newLogoFileName)
          )
        } catch (error) {
          console.error('Error copying logo:', error)
          newLogoFileName = undefined
        }
      }

      // Criar o novo proprietário
      const newProprietario = await Proprietario.create({
        nome: newNome,
        sigla: newSigla,
        descricao: originalProprietario.descricao,
        logo: newLogoFileName
      })

      return response.created({
        ...newProprietario.toJSON(),
        logo: this.getLogoUrl(newProprietario.logo)
      })
    } catch (error) {
      return response.badRequest(error.message)
    }
  }
}