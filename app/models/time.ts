import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Proprietario from './proprietario.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Solucao from './solucao.js'
export default class Time extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nome: string

  @column()
  declare funcao: string

  @column()
  declare data_inicio: string

  @column()
  declare data_fim: string

  @column()
  declare proprietario_id: number

  @column()
  declare solucao_id: number

  @belongsTo(() => Proprietario)
  declare proprietario: BelongsTo<typeof Proprietario>

  @belongsTo(() => Solucao)
  declare solucao: BelongsTo<typeof Solucao>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}