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

router.get('/checkisalive', (req, res) => {
    res.status(200).send(true);
    // TODO: modify -> pass the requester node name
    // TODO: if the requester node is a lower number -> return 200 and start election
    // TODO: if the requester node is a higher number -> return 200 and wait for it to continue election
});

module.exports = router;