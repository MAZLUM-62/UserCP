require('dotenv').config();
const mysql2 = require('mysql2/promise');

const connectionConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

console.log('Connection Config:', connectionConfig);

async function createDatabase() {
  const connection = await mysql2.createConnection({
    host: connectionConfig.host,
    user: connectionConfig.user,
    password: connectionConfig.password,
  });

  try {
    // Create the database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    console.log('Database created or already exists');

    // Use the created database
    await connection.query(`USE \`${process.env.DB_NAME}\``);

    // Check if the 'users' table exists
    const [rows] = await connection.query("SHOW TABLES LIKE 'users'");

    if (rows.length === 0) {
      // 'users' table doesn't exist, so create it
      await connection.query(`
        CREATE TABLE users (
          user_id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          user_status ENUM('Admin', 'Entwickler', 'Support', 'Teamler', 'Crimeverwaltung', 'Fraktionsverwaltung', 'Gamedesign', 'Staatsbürger', 'Tourist', 'Ausschluss', 'Auszeit') DEFAULT 'Tourist',
          discord_id VARCHAR(255) UNIQUE,
          global_playtime INT DEFAULT 0,
          whitelist_status ENUM('true', 'false') DEFAULT 'false',
          whitelist_attempt_date DATE DEFAULT NULL,
          ig_whitelist_status ENUM('true', 'false') DEFAULT 'false',
          ig_whitelist_attempt_date DATE DEFAULT NULL,
          avatar VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      console.log('Table "users" created');
    } else {
      console.log('Table "users" already exists. All nice!');
    }

    const [userColumns] = await connection.query("SHOW COLUMNS FROM users LIKE 'user_id'");
    if (userColumns.length === 0) {
      console.error('Column "user_id" does not exist in "users" table');
    }

    // Create the 'tickets' table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        ticket_id INT AUTO_INCREMENT PRIMARY KEY,  
        user_id INT NOT NULL,
        subject VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status ENUM('Offen', 'In Bearbeitung', 'Abgeschlossen', 'Weitergeleitet') DEFAULT 'Offen',
        last_ticket_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      )
    `);

    // Create the 'ticket_responses' table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ticket_responses (
        response_id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        last_ticket_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      )
    `);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

createDatabase();

const db = {
  query: async function (sql, values) {
    const connection = await mysql2.createConnection(connectionConfig);
    const [result, fields] = await connection.execute(sql, values);
    await connection.end();
    return result;
  },
};

module.exports = {
  createDatabase,
  db,
};
