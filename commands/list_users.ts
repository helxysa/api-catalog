import { BaseCommand } from '@adonisjs/core/ace'
import User from '../app/models/user.js'

export default class ListUsers extends BaseCommand {
  static commandName = 'list:users'
  static description = 'List all users in the database'

  async run() {
    this.logger.info('Listing all users...')
    
    // Connect to the database
    const db = await this.application.container.make('Adonis/Lucid/Database')
    await db.connect()

    try {
      // Fetch all users
      const users = await User.all()
      
      if (users.length === 0) {
        this.logger.info('No users found in the database')
        return
      }

      // Display users in a table
      this.logger.success(`Found ${users.length} users`)
      
      const table = this.ui.table()
      table.head(['ID', 'Name', 'Email', 'Created At'])
      
      users.forEach((user) => {
        table.row([
          user.id.toString(),
          user.fullName || 'N/A',
          user.email,
          user.createdAt.toFormat('yyyy-MM-dd HH:mm:ss')
        ])
      })
      
      table.render()
    } finally {
      // Close the database connection
      await db.disconnect()
    }
  }
}
