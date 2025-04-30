import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class UserSeeder extends BaseSeeder {
  async run() {
    await User.create({
      fullName: 'Admin User',
      email: 'catalog@mpap.mp.br',
      password: 'catalog@2025',
    })
  }
}
