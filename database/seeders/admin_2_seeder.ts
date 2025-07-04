import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class Admin2Seeder extends BaseSeeder {
  async run() {
    await User.create({
      fullName: 'Admin User 2',
      email: 'admin2@admin.mp.br',
      password: 'catalog@2025',
      roleId: 2,
    })
  }
}