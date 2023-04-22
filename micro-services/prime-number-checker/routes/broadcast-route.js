const express = require('express');
const router = express.Router();
const Broadcaster = require('../controllers/broadcaster');
const Election = require('../controllers/election');

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

router.get('/checkisalive/:id', (req, res) => {
    Election.respondIsAlive(req.params.id).then((data) => {
        res.status(data.status).send(true);
    }).catch((err) => {
        // either way the node is alive -> hence returning ok status
        res.status(200).send(true);
    });
});

module.exports = router;