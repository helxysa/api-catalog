import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Demanda from './demanda.js'

export default class HistoricoDemanda extends BaseModel {
  public static table = 'historico_demandas'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare demanda_id: number

  @column()
  declare usuario: string

  @column()
  declare descricao: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Demanda, {
    foreignKey: 'demanda_id'
  })
  declare demanda: BelongsTo<typeof Demanda>
}