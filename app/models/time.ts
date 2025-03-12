import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Proprietario from './proprietario.js'

export default class Time extends BaseModel {
 public static table = 'times'

  @column({ isPrimary: true })
  declare id: number
  
  @column()
  declare nome: string

  @column()
  declare descricao: string

  @column()
  declare proprietario_id: number

  @belongsTo(() => Proprietario)
  declare proprietario: BelongsTo<typeof Proprietario>  

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}