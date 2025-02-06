import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Solucao from './solucao.js'

export default class HistoricoSolucao extends BaseModel {
  public static table = 'historico_solucoes'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare solucao_id: number

  @column()
  declare usuario: string

  @column()
  declare descricao: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Solucao, {
    foreignKey: 'solucao_id'
  })
  declare solucao: BelongsTo<typeof Solucao>
}
