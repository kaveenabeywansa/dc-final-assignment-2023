const express = require('express');
var Routes = express.Router();

const BroadcastRouter = require('./routes/broadcast-route');

Routes.use('/broadcast/', BroadcastRouter);

Routes.use('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

module.exports = Routes;