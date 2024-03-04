require('dotenv').config();
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { sign } = require('jsonwebtoken');
const { db } = require('../config/database'); 
const authenticate = require('./../middlewares/authenticate');
router.use(authenticate);

const discordClientId = process.env.DISCORD_CLIENT_ID;

router.get('/discord/login', (req, res) => {
  const url = `https://discord.com/api/oauth2/authorize?client_id=${discordClientId}&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fauth%2Fdiscord%2Fcallback&scope=identify`;
  res.redirect(url);
});

router.get('/example', (req, res) => {
  // Handle the API logic
  res.json({ message: 'Example API response' });
});

router.get('/discord/callback', async (req, res) => {
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

router.get('/logout', (req, res) => {
  try {
    // Überprüfe, ob der Benutzer angemeldet ist
    if (req.user) {
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


module.exports = router;
