import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'solucoes'

  async up() {
    // Primeiro, remove a restrição de chave estrangeira
    await this.db.rawQuery('ALTER TABLE solucoes DROP CONSTRAINT solucoes_linguagem_id_foreign')

    // Depois, altera o tipo da coluna
    this.schema.alterTable(this.tableName, (table) => {
      table.text('linguagem_id').alter()
    })
  }

  async down() {
    // Reverte para integer
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('linguagem_id').unsigned().alter()
    })

    // Restaura a chave estrangeira
    await this.db.rawQuery('ALTER TABLE solucoes ADD CONSTRAINT solucoes_linguagem_id_foreign FOREIGN KEY (linguagem_id) REFERENCES linguaguens(id) ON DELETE SET NULL')
  }
}