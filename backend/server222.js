require('dotenv').config();

const express = require('express');
const cors = require('cors');

// installieren?
const bodyParser = require('body-parser');
const axios = require('axios');
const { sign } = require('jsonwebtoken');
const { db } = require('./config/database');

const cookieParser = require('cookie-parser');

//middleware
const authenticate = require('./middlewares/authenticate');

const router = express.Router();


// Imports
const app = express();
const PORT = process.env.PORT || 3001;

router.use(authenticate);

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/', router);

app.get('/user/me', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json(req.user);
});

app.get('/auth/discord/login', (req, res) => {
  const url = `https://discord.com/api/oauth2/authorize?client_id=1191175746463469619&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fauth%2Fdiscord%2Fcallback&scope=identify`;
  res.redirect(url);
});

app.get('/auth/discord/callback', async (req, res) => {
  try {
    const code = req.query.code;

    if (!code) {
      throw new Error('NoCodeProvided');
    }

    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI,
    });

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', params, { headers });

    const accessToken = tokenResponse.data.access_token;

    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { id, username, avatar } = userResponse.data;

    // Check if the user exists in the database
    const [existingUser] = await db.query('SELECT * FROM users WHERE discord_id = ?', [id]);

    if (existingUser) {
      // Update the existing user
      await db.query('UPDATE users SET username = ?, avatar = ? WHERE discord_id = ?', [username, avatar, id]);
      console.log('User updated in the database');
    } else {
      // Insert a new user
      await db.query('INSERT INTO users (discord_id, username, avatar) VALUES (?, ?, ?)', [id, username, avatar]);
      console.log('New user inserted into the database');
    }

    // Generate a JWT token
    const token = sign({ sub: id }, process.env.JWT_SECRET, { expiresIn: '5m' });

    // Set the token as a cookie and redirect
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' }).redirect(process.env.CLIENT_REDIRECT_URL);
  } catch (error) {
    console.error('Error during Discord authentication:', error);
    res.status(500).send(error.toString());
  }
});


router.get('/auth/logout', (req, res) => {
  try {
    // Überprüfe, ob der Benutzer angemeldet ist
    if (req.user) {
      // Füge hier deine Logout-Logik für tokenbasierte Authentifizierung hinzu
      // Beispiel: Setze das Token auf null oder lösche es aus der Datenbank
      // Annahme: Das Token ist im req.user.token gespeichert
      req.user.token = null;
    }

    // Entferne das Cookie
    res.clearCookie('token');

    // Sende eine Bestätigung zurück
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Error during logout' });
  }
});

app.post('/api/create-ticket', async (req, res) => {
  try {
    const { user_id, subject, category, description } = req.body;

    const result = await db.query(
      'INSERT INTO tickets (user_id, subject, category, description) VALUES (?, ?, ?, ?)',
      [user_id, subject, category, description]
    );

    res.status(201).json({ ticket_id: result.insertId });
  } catch (error) {
    console.error('Error creating ticket:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/ticketstest', async (req, res) => {
  try {
    // Benutzer-ID aus dem Authentifizierungs-Middleware erhalten
    const userId = req.user.user_id;
    // Fetch tickets des aktuellen Benutzers aus der Datenbank
    const result = await db.query('SELECT * FROM tickets WHERE user_id = ?', [userId]);
    res.json(result);
  } catch (error) {
    console.error('Error fetching X:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/tickets', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const user_id = req.user.user_id;

  try {
    // Fetch tickets from the database
    const result = await db.query('SELECT * FROM tickets WHERE user_id = ?', [user_id]);
    res.json(result);
  } catch (error) {
    console.error('Error fetching tickets:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/', (req, res) => {
  res.send('Hallo von deinem Express.js-Backend!');
});

// Starte den Server
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});