
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'historico_demandas'

  async up() {
   this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('demanda_id').unsigned().references('id').inTable('demandas').onDelete('CASCADE')
      table.integer('proprietario_id').unsigned().references('id').inTable('proprietarios').onDelete('CASCADE')
      table.string('usuario')
      table.text('descricao')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
