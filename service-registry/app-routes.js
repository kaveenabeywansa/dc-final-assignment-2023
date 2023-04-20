const express = require('express');
var Routes = express.Router();

const ServiceRegistry = require('./routes/service-reg-route');

Routes.use('/service-registry/', ServiceRegistry);
Routes.use('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

module.exports = Routes;