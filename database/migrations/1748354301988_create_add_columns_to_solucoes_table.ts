import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'solucoes'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.json('times')
      table.json('atualizacoes')

    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}