
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'solucoes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('demanda_id').unsigned().references('id').inTable('demandas').onDelete('CASCADE')
      table.string('nome')
      table.string('sigla')
      table.string('descricao')
      table.string('versao')
      table.integer('tipo_id').unsigned().references('id').inTable('tipos').onDelete('SET NULL')
      table.integer('linguagem_id').unsigned().references('id').inTable('linguaguens').onDelete('SET NULL')
      table.integer('desenvolvedor_id').unsigned().references('id').inTable('desenvolvedores').onDelete('SET NULL')
      table.integer('categoria_id').unsigned().references('id').inTable('categorias').onDelete('SET NULL')
      table.integer('responsavel_id').unsigned().references('id').inTable('responsaveis').onDelete('SET NULL')
      table.integer('status_id').unsigned().references('id').inTable('status').onDelete('SET NULL')
      table.integer('proprietario_id').unsigned().references('id').inTable('proprietarios').onDelete('CASCADE')
      table.string('data_status')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
