require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const BodyParser = require('body-parser');
const Routes = require('./app-routes');
const ParamExtractor = require('./helpers/param-extractor');
const Logger = require('./helpers/logger');
const ServiceRegistry = require('./controllers/service-registry');
const Election = require('./controllers/election');
const RuntimeDB = require('./schema/runtime-schema');

// READ ENV and set defaults
var PORT_NO = process.env.DEFAULT_PORT_NO;
var BASE_URL = process.env.BASE_URL;
RuntimeDB.SERVICE_REGISTRY_URL = process.env.SERVICE_REGISTRY_URL;
RuntimeDB.SIDE_CAR_LOGGER_URL = process.env.SIDE_CAR_LOGGER_URL;

// global variables
RuntimeDB.NODE_NAME = ServiceRegistry.generateNodeName();
RuntimeDB.SERVICE_REG_LIST = [];

// run setup and configs
try {
    var argsList = ParamExtractor.extract(process.argv.slice(2));

    // set variables
    if (argsList) {
        PORT_NO = argsList.portNumber ? argsList.portNumber : PORT_NO;
        RuntimeDB.SERVICE_REGISTRY_URL = argsList.SERVICE_REGISTRY_URL ? argsList.SERVICE_REGISTRY_URL : RuntimeDB.SERVICE_REGISTRY_URL;
    }

    Logger.log('Node Name', RuntimeDB.NODE_NAME);
    Logger.log('Port No:', PORT_NO);
    Logger.log('Service Registry:', RuntimeDB.SERVICE_REGISTRY_URL);
} catch (error) {
    Logger.error('Error', error);
    process.exit(-1);
}

// start server
app.use(BodyParser.json());
app.use(cors());
app.use('/', Routes);
app.listen(PORT_NO, (err) => {
    if (err) {
        Logger.error(err);
        process.exit(-1);
    }
    Logger.log('Prime number checker instance running on port ' + PORT_NO);

    // register node
    ServiceRegistry.registerNode(RuntimeDB.SERVICE_REGISTRY_URL, RuntimeDB.NODE_NAME, BASE_URL, PORT_NO)
        .then(() => {
            Logger.log('Node registered successfully!');
            updateRegistry().then(() => {
                // hold election
                const THRESHOLD_NODE_LIMIT_TO_START_ELECTION = 8; // TODO: change to 7 or more for demo
                let hasLeader = RuntimeDB.SERVICE_REG_LIST.find(el => el.isLeader);
                if (!hasLeader && RuntimeDB.SERVICE_REG_LIST.length >= THRESHOLD_NODE_LIMIT_TO_START_ELECTION) {
                    Election.startElection();
                } else if (hasLeader) {
                    RuntimeDB.LEADER_NODE_NAME = hasLeader.nodeName;
                }
            });
        })
        .catch((err) => {
            Logger.log('Error while registering node. Please re-try!');
            process.exit(-1);
        });

    // continuously fetch the registry for updates
    function updateRegistry() {
        // Logger.log('Updating service registry list...');
        return ServiceRegistry.getAll(RuntimeDB.SERVICE_REGISTRY_URL).then((data) => {
            if (data) {
                RuntimeDB.SERVICE_REG_LIST = data;
            }
        });
    }

    // keep updating the registry
    var updateRegSubscription = setInterval(updateRegistry, 1000);
    var chkLeaderAliveSubscription = setInterval(Election.checkIsLeaderAlive ,1000);
    // clearInterval(updateRegSubscription); // use this to stop the loop if necessary anywhere
});
