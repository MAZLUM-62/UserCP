const express = require('express');
const router = express.Router();
const { db } = require('../config/database'); // Stelle sicher, dass die Pfadangabe korrekt ist
const authenticate = require('./../middlewares/authenticate');
const rules = require('../models/Regeln');

router.use(authenticate);


router.get('/rules', async (req, res) => {
  res.json(rules)
});

router.post('/create-ticket', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
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

//get Request für eine Liste von Accounts
router.get('/userlist', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const user_role = req.user.user_status;
  try {
    let result;
    if (user_role === 'Admin') {
      result = await db.query('SELECT * FROM users');
    } else {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    res.json(result);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/tickets', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const user_id = req.user.user_id;
  const user_role = req.user.user_status;

  try {
    let result;
    if (user_role === 'Admin') {
      // Wenn der Benutzer ein Admin ist, dann alle Tickets abrufen
      result = await db.query('SELECT * FROM tickets');
    } else {
      // Wenn der Benutzer kein Admin ist, dann nur seine eigenen Tickets abrufen
      result = await db.query('SELECT * FROM tickets WHERE user_id = ?', [user_id]);
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching tickets:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/tickets/:id', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user_id = req.user.user_id;
  const user_status = req.user.user_status;
  const ticket_id = req.params.id;

  try {
    let result;

    if (user_status === 'Admin') {
      // Wenn der Benutzer ein Admin ist, kann er alle Tickets sehen
      result = await db.query('SELECT * FROM tickets WHERE ticket_id = ?', [ticket_id]);
    } else {
      // Wenn der Benutzer kein Admin ist, überprüfe, ob er das Ticket besitzt
      result = await db.query('SELECT * FROM tickets WHERE user_id = ? AND ticket_id = ?', [user_id, ticket_id]);
    }

    if (result.length === 0) {
      // Benutzer hat keine Berechtigung für dieses Ticket
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching ticket details:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/tickets/:id/getresponses', async (req, res) => {
  try {
    const ticketId = req.params.id;
    const responses = await db.query('SELECT * FROM ticket_responses WHERE ticket_id = ?', [ticketId]);
    res.json(responses);
  } catch (error) {
    console.error('Error fetching ticket responses:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/tickets/:id/postresponses', async (req, res) => {
  try {
    const ticketId = req.params.id;
    const userId = req.user.user_id; // Extrahiere die Benutzer-ID aus dem Authentifizierungstoken
    const { message } = req.body;

    const response = await db.query('INSERT INTO ticket_responses (ticket_id, user_id, message) VALUES (?, ?, ?)', [ticketId, userId, message]);

    // Optional: Rückgabe der neu erstellten Antwort
    const newResponse = await db.query('SELECT * FROM ticket_responses WHERE response_id = ?', [response.insertId]);
    res.status(201).json(newResponse[0]);
  } catch (error) {
    console.error('Error adding ticket response:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;
