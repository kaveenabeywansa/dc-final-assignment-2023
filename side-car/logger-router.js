const express = require('express');
const router = express.Router();

// log
router.post('/', (req, res) => {
    let body = req.body;

    let loggerMsg = '\nNode name: ' + body.nodeName + '\nLogger message: ' + body.message + '\nDate/Time: ' + new Date().toLocaleString();
    console.log(loggerMsg);

    res.status(200).send(true);
});

module.exports = router;