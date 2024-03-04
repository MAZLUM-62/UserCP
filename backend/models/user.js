// user.js
const { db } = require('../config/database');

class User {
  static async findByDiscordId(discordId) {
    const [user] = await db.query('SELECT * FROM users WHERE discord_id = ?', [discordId]);
    return user;
  }

  static async updateOrCreate({ discordId, username, avatar }) {
    // Check if the user exists in the database
    const [existingUser] = await User.findByDiscordId(discordId);

    if (existingUser) {
      // Update the existing user
      await db.query('UPDATE users SET username = ?, avatar = ? WHERE discord_id = ?', [username, avatar, discordId]);
      console.log('User updated in the database');
    } else {
      // Insert a new user
      await db.query('INSERT INTO users (discord_id, username, avatar) VALUES (?, ?, ?)', [discordId, username, avatar]);
      console.log('New user inserted into the database');
    }
  }
}

module.exports = User;
