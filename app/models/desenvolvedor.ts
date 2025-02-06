import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Desenvolvedor extends BaseModel {

  public static table = 'desenvolvedores'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nome: string

  @column()
  declare email: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}