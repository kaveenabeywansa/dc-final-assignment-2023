const express = require('express');
const cors = require('cors');
const app = express();
const BodyParser = require('body-parser');
const Routes = require('./app-routes');
const portNo = 9001;

app.use(BodyParser.json());
app.use(cors());
app.use('/', Routes);

app.listen(portNo, (err) => {
    if (err) {
        console.log(err);
        process.exit(-1);
    }
    console.log('Service registry running on port ' + portNo);
});