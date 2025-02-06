// hello-world/app/models/demanda.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import Responsavel from './responsavel.js'
import Status from './status.js'
import Demanda from './demanda.js'
import Tipo from './tipo.js'
import Linguagem from './linguaguem.js'
import Desenvolvedor from './desenvolvedor.js'
import Categoria from './categoria.js'

export default class Solucao extends BaseModel {
  public static table = 'solucoes'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare demanda_id: number
  
  @column()
  declare nome: string

  @column()
  declare sigla: string

  @column()
  declare descricao: string

  @column()
  declare versao: string

  @column()
  declare tipo_id: number

  @column()
  declare linguagem_id: number

  @column()
  declare desenvolvedor_id: number

  @column()
  declare categoria_id: number

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


  @belongsTo(() => Demanda, {
    foreignKey: 'demanda_id'
  })
  declare demanda: BelongsTo<typeof Demanda>

  @belongsTo(() => Tipo, {
    foreignKey: 'tipo_id'
  })
  declare tipo: BelongsTo<typeof Tipo>

  @belongsTo(() => Linguagem, {
    foreignKey: 'linguagem_id'
  })
  declare linguagem: BelongsTo<typeof Linguagem>

  @belongsTo(() => Categoria, {
    foreignKey: 'categoria_id'
  })
  declare categoria: BelongsTo<typeof Categoria>

  @belongsTo(() => Desenvolvedor, {
    foreignKey: 'desenvolvedor_id'
  })
  declare desenvolvedor: BelongsTo<typeof Desenvolvedor>

  @belongsTo(() => Responsavel, {
    foreignKey: 'responsavel_id'
  })
  declare responsavel: BelongsTo<typeof Responsavel>

  @belongsTo(() => Status, {
    foreignKey: 'status_id'
  })
  declare status: BelongsTo<typeof Status>
}
