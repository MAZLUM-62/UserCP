require('dotenv').config();
// server.js
const express = require('express');
const cors = require('cors');
const authenticate = require('./middlewares/authenticate'); // Import your authentication middleware

const bodyParser = require('body-parser');

const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');
const questionsRouters = require('./routes/questionsRouters');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(authenticate); // Apply authentication middleware globally for all routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/questions', questionsRouters);

app.get('/test', (req, res) => {
  res.send('Hello from your Express.js Backend!');
});

app.get('/user/me', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json(req.user);
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
