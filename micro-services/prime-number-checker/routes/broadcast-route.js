const express = require('express');
const router = express.Router();
const Broadcaster = require('../controllers/broadcaster');
const Election = require('../controllers/election');
const Scheduler = require('../controllers/scheduler');

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

router.get('/checkisalive', (req, res) => {
    res.status(200).send(true);
});

router.post('/task-proposer', (req, res) => {
    res.status(200).send(true);
    Scheduler.acceptProposerTask(req.body);
});

router.post('/task-accepter', (req, res) => {
    Scheduler.acceptAccepterTask(req.body).then(() => {
        // accepting the answer
        res.status(200).send(true);
    }).catch((err) => {
        // incorrect answer. request a retry
        res.status(406).send(false);
    });
});

router.post('/task-update-learner', (req, res) => {
    Scheduler.acceptLearnerTask(req.body);
    res.status(200).send(true);
});

router.post('/task-learner', (req, res) => {
    Scheduler.acceptLearningResps(req.body);
    res.status(200).send(true);
});

router.post('/task-finalized', (req, res) => {
    Scheduler.finalizeTask(req.body);
    res.status(200).send(true);
});

module.exports = router;