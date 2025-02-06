import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Prioridade extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

   
  @column()
  declare nome: string

  @column()
  declare descricao: string


  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}