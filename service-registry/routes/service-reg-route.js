const express = require('express');
const router = express.Router();
const Controller = require('../controllers/registry-controller');

// create new user
router.post('/', (req, res) => {
    console.log('registering new node...');
    Controller.newRegistry(req.body).then((data) => {
        res.status(data.status).send({ message: data.message });
    }).catch((err) => {
        res.status(err.status).send({ message: err.message });
    });
});
// get all users
router.get('/', (req, res) => {
    console.log('fetching all registry data...');
    Controller.getAll().then((data) => {
        res.status(data.status).send(data.data);
    }).catch((err) => {
        res.status(err.status).send({ message: err.message });
    });
});
// update leader node
router.post('/updateleader', (req, res) => {
    console.log('updating leader node...');
    Controller.updateLeaderNode(req.body).then((data) => {
        res.status(data.status).send({ message: data.message });
    }).catch((err) => {
        res.status(err.status).send({ message: err.message });
    });
});
// report crashed nodes
router.post('/deregister', (req, res) => {
    console.log('deregistering inactive nodes...');
    Controller.deregisterNodes(req.body).then((data) => {
        res.status(data.status).send({ message: data.message });
    }).catch((err) => {
        res.status(err.status).send({ message: err.message });
    });
});
// update learner node
router.post('/updatelearner', (req, res) => {
    console.log('updating learner node...');
    Controller.updateLearnerNode(req.body).then((data) => {
        res.status(data.status).send({ message: data.message });
    }).catch((err) => {
        res.status(err.status).send({ message: err.message });
    });
});

module.exports = router;