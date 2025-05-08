import { BaseSchema } from '@adonisjs/lucid/schema'
import Roles from '../../app/Enums/enums.js'

export default class extends BaseSchema {
  protected tableName = 'roles'

  async up() {
    this.defer(async (db) => {
      await db.table(this.tableName).insert({
        id: Roles.MANAGER,
        name: 'manager',
        created_at: new Date(),
        updated_at: new Date(),
      })
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.from(this.tableName).where('id', Roles.MANAGER).delete()
    })
  }
}
