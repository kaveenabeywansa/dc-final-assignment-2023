require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const BodyParser = require('body-parser');
const Routes = require('./app-routes');
const ParamExtractor = require('./helpers/param-extractor');
const ServiceRegistry = require('./helpers/service-registry');

// READ ENV and set defaults
var PORT_NO = process.env.DEFAULT_PORT_NO;
var SERVICE_REGISTRY_URL = process.env.SERVICE_REGISTRY_URL;
var BASE_URL = process.env.BASE_URL;

// global variables
var NODE_NAME = ServiceRegistry.generateNodeName();
var SERVICE_REG_LIST = [];

// run setup and configs
try {
    var argsList = ParamExtractor.extract(process.argv.slice(2));

    // set variables
    if (argsList) {
        PORT_NO = argsList.portNumber ? argsList.portNumber : PORT_NO;
        SERVICE_REGISTRY_URL = argsList.SERVICE_REGISTRY_URL ? argsList.SERVICE_REGISTRY_URL : SERVICE_REGISTRY_URL;
    }

    console.log('Node Name', NODE_NAME);
    console.log('Port No:', PORT_NO);
    console.log('Service Registry:', SERVICE_REGISTRY_URL);
} catch (error) {
    console.log('Error', error);
    process.exit(-1);
}

// start server
app.use(BodyParser.json());
app.use(cors());
app.use('/', Routes);
app.listen(PORT_NO, (err) => {
    if (err) {
        console.log(err);
        process.exit(-1);
    }
    console.log('Prime number checker instance running on port ' + PORT_NO);

    // register node
    ServiceRegistry.registerNode(SERVICE_REGISTRY_URL, NODE_NAME, BASE_URL, PORT_NO)
        .then(() => {
            console.log('Node registered successfully!');
            updateRegistry();
        })
        .catch((err) => {
            console.log('Error while registering node. Please re-try!');
            process.exit(-1);
        });

    // continuously fetch the registry for updates
    function updateRegistry() {
        console.log('Updating service registry list...');
        ServiceRegistry.getAll(SERVICE_REGISTRY_URL).then((data) => {
            if (data) {
                SERVICE_REG_LIST = data;
            }
        });
    }
    
    var updateRegSubscription = setInterval(updateRegistry, 5000);
    // clearInterval(updateRegSubscription); // use this to stop the loop if necessary anywhere
});
