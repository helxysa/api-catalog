
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'status'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
  
      table.increments('id').primary()
      table.string('nome').notNullable()
      table.string('descricao')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
