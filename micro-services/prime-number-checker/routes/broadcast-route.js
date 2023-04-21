const express = require('express');
const router = express.Router();
const Broadcaster = require('../controllers/broadcaster');

// get new loader broadcast
router.post('/newLeader', (req, res) => {
    console.log('updating the leader...');
    try {
        Broadcaster.newLeaderUpdate(req.body);
        res.status(200).send({ message: 'Leader Updated!' });
    } catch (err) {
        res.status(err.status).send({ message: err.message });
    }
});

module.exports = router;