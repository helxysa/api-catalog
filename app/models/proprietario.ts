import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Proprietario extends BaseModel {

  public static table = 'proprietarios'

  @column({ isPrimary: true })
  declare id: number

     
  @column()
  declare nome: string

     
  @column()
  declare sigla: string

     
  @column()
  declare descricao: string

  @column()
  declare logo: string 

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}