require('dotenv').config();
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { db } = require('../config/database');
const questions = require('../models/questions');

const authenticate = require('./../middlewares/authenticate');
router.use(authenticate);

router.use(bodyParser.json());

router.get('/getRandomQuestions', (req, res) => {
    const randomQuestions = getRandomQuestions(questions, 3);
    res.json(randomQuestions);
});

router.post('/checkAnswers', (req, res) => {
    const userAnswers = req.body.answers;
    const correctAnswers = getCorrectAnswers(questions);
    const correctCount = countCorrectAnswers(userAnswers, correctAnswers);
    const passPercentage = 80;

    if ((correctCount / 3) * 100 >= passPercentage) {
        res.json({ result: 'success', message: 'Whitelist bestanden' });
    } else {
        res.json({ result: 'failure', message: 'Whitelist nicht bestanden' });
    }
});


// Überprüfe, ob der Benutzer bereits heute einen Versuch unternommen hat
router.post('/whitelistAttempt', async (req, res) => {
    try {
        const currentDate = new Date().toISOString().slice(0, 10);
        const userId = req.body.userId;

        // Check if the user is already whitelisted
        const isWhitelisted = await checkWhitelistStatus(userId);

        if (isWhitelisted) {
            return res.json({ success: false, message: 'Du hast die Whitelist bereits bestanden.' });
        }

        // Continue with the whitelist attempt logic
        const results = await db.query(
            'SELECT * FROM users WHERE user_id = ? AND whitelist_attempt_date = ?',
            [userId, currentDate]
        );

        if (results.length > 0) {
            return res.status(400).json({ error: 'Du hast bereits heute einen Versuch unternommen.' });
        }

        // Update the whitelist_status in the database upon successful attempt
        await db.query('UPDATE users SET whitelist_status = true WHERE user_id = ?', [userId]);

        res.status(200).json({ success: true, message: 'Whitelist bestanden' });
    } catch (error) {
        console.error('Fehler beim Versuch:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

async function checkWhitelistStatus(userId) {
    try {
        const results = await db.query('SELECT whitelist_status FROM users WHERE user_id = ?', [userId]);
        console.log('Database results:', results);

        return results.length > 0 && results[0].whitelist_status === true;
    } catch (error) {
        console.error('Error in checkWhitelistStatus:', error);
        throw error; // Propagate the error for better debugging
    }
}


function getRandomQuestions(questions, count) {
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffledQuestions.slice(0, count).map(q => ({
        question: q.question,
        options: q.options
    }));
    return selectedQuestions;
}

function countCorrectAnswers(userAnswers, correctAnswers) {
    let count = 0;
    for (let i = 0; i < userAnswers.length; i++) {
        if (userAnswers[i] === correctAnswers[i]) {
            count++;
        }
    }
    return count;
}

function getCorrectAnswers(questions) {
    return questions.map(q => q.correctAnswer);
}

module.exports = router;
