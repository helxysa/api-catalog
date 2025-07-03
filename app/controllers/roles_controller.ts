//eslint-disable

import type { HttpContext } from '@adonisjs/core/http'
import Role from '../models/role.js'

export default class RolesController {
  public async index({ response }: HttpContext) {
    try {
      const roles = await Role.all()
      return response.ok(roles)
    } catch (err) {
      console.error(err)
    }
  }

  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['name'])
      const role = await Role.create({
        nome: data.name,
      })
      return response.created(role)
    } catch (err) {
      console.error(err)
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const role = await Role.findOrFail(params.id)
      return response.ok(role)
    } catch (err) {
      console.error(err)
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const role = await Role.findOrFail(params.id)
      const data = request.only(['name'])
      role.merge({ nome: data.name })
      await role.save()
      return response.ok(role)
    } catch (err) {
      console.error(err)
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      const role = await Role.findOrFail(params.id)
      await role.delete()
      return response.noContent()
    } catch (err) {
      console.error(err)
    }
  }
}
