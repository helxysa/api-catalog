import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Proprietario from './proprietario.js'
import Solucao from './solucao.js'
export default class historicoDasAtualizacoes extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nome: string

  @column()
  declare descricao: string

  @column()
  declare data_atualizacao: Date

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