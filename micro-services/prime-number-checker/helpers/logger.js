const HTTP = require('./http-client');
const RuntimeDB = require('../schema/runtime-schema');

var Logger = function () {

    this.log = (message, payload = false) => {
        this.updateAndPrint(message, payload);
    };

    this.error = (message, payload = false) => {
        this.updateAndPrint(message, payload, '\x1b[31m');
    };

    this.output = (message, payload = false) => {
        this.updateAndPrint(message, payload, '\x1b[32m');
    };

    this.updateAndPrint = (message, payload, highlightColor = false) => {
        try {
            let nodeEndPointUrl = RuntimeDB.SIDE_CAR_LOGGER_URL + '/logger';
            let objBody = {
                nodeName: RuntimeDB.NODE_NAME,
                message: message
            };

            // send to proxy
            HTTP.post(nodeEndPointUrl, objBody);

            // locally print
            if (highlightColor) {
                message = highlightColor + message + '\x1b[0m';
            }

            if (payload) {
                console.log(message, payload);
            } else {
                console.log(message);
            }
        } catch (error) {
            // ignore errors
        }
    };

};

module.exports = new Logger();