  // middleware/authenticate.js
  const { db } = require('../config/database');
  const { verify, sign } = require('jsonwebtoken');

  module.exports = async (req, res, next) => {
    const token = req.cookies.token;

    try {
   
      if (token) {
        const decoded = await verify(token, process.env.JWT_SECRET);
        if (decoded.exp <= Date.now() / 1000) {
          const newAccessToken = sign({ sub: decoded.sub }, process.env.JWT_SECRET, { expiresIn: '15m' });
          // Update the token in the response
          res.cookie('token', newAccessToken, { httpOnly: true, sameSite: 'lax' });
          // Set the decoded user information
          req.user = { sub: decoded.sub };
        } else {
          const [user] = await db.query('SELECT * FROM users WHERE discord_id = ?', [decoded.sub]);

          if (user) {
            req.user = user;
            //console.log('User found:', user);
          } else {
            req.user = null;
            //console.log('User not found for ID:', decoded.sub);
          }
        }
      } else {
        req.user = null;
        //console.log('No token found');
      }
    } catch (e) {
      req.user = null;
      //console.error('Error decoding/verifying token:', e);
    }

    next();
  };
