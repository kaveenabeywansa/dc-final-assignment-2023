const express = require('express');
var Routes = express.Router();

const LoggerRouter = require('./logger-router');

Routes.use('/logger/', LoggerRouter);

module.exports = Routes;