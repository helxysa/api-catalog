import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'demandas'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('nome').notNullable()
      table.integer('proprietario_id').unsigned().references('id').inTable('proprietarios').onDelete('CASCADE')
      table.string('sigla')
      table.string('descricao')
      table.string('demandante')
      table.string('fator_gerador')
      table.integer('alinhamento_id').unsigned().references('id').inTable('alinhamentos').onDelete('SET NULL')
      table.integer('prioridade_id').unsigned().references('id').inTable('prioridades').onDelete('SET NULL')
      table.integer('responsavel_id').unsigned().references('id').inTable('responsaveis').onDelete('SET NULL')
      table.integer('status_id').unsigned().references('id').inTable('status').onDelete('SET NULL')
      table.string('data_status')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
