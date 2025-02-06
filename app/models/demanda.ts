// hello-world/app/models/demanda.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Proprietario from './proprietario.js'
import Alinhamento from './alinhamento.js'
import Prioridade from './prioridade.js'
import Responsavel from './responsavel.js'
import Status from './status.js'

export default class Demanda extends BaseModel {
  public static table = 'demandas'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare proprietario_id: number

  @column()
  declare nome: string

  @column()
  declare sigla: string

  @column()
  declare descricao: string

  @column()
  declare demandante: string

  @column()
  declare fator_gerador: string

  @column()
  declare alinhamento_id: number

  @column()
  declare prioridade_id: number

  @column()
  declare responsavel_id: number

  @column()
  declare status_id: number

  @column()
  declare data_status: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime


  @belongsTo(() => Proprietario, {
    foreignKey: 'proprietario_id'
  })
  declare proprietario: BelongsTo<typeof Proprietario>

  @belongsTo(() => Alinhamento, {
    foreignKey: 'alinhamento_id'
  })
  declare alinhamento: BelongsTo<typeof Alinhamento>

  @belongsTo(() => Prioridade, {
    foreignKey: 'prioridade_id'
  })
  declare prioridade: BelongsTo<typeof Prioridade>

  @belongsTo(() => Responsavel, {
    foreignKey: 'responsavel_id'
  })
  declare responsavel: BelongsTo<typeof Responsavel>

  @belongsTo(() => Status, {
    foreignKey: 'status_id'
  })
  declare status: BelongsTo<typeof Status>
}
