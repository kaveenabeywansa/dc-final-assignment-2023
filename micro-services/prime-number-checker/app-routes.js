const express = require('express');
var Routes = express.Router();

Routes.use('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

module.exports = Routes;