import { BaseSchema } from '@adonisjs/lucid/schema'
import Roles from '../../app/Enums/enums.js'

export default class extends BaseSchema {
  protected tableName = 'roles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 50).notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.defer(async (db) => {
      await db.table(this.tableName).multiInsert([
        {
          id: Roles.USER,
          name: 'user',
        },
        {
          id: Roles.ADMIN,
          name: 'admin',
        },
      ])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
