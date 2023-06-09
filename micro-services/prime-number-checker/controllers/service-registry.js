const HTTP = require('../helpers/http-client');
const Logger = require('../helpers/logger');

var ServiceRegistry = function () {

    this.generateNodeName = () => {
        let epochTime = Date.now().toString();
        let randomNumb = (Math.floor(100 + Math.random() * 900)).toString();
        return randomNumb.concat(epochTime);
    };

    this.registerNode = (registryLocation, nodeName, baseUrl, port) => {
        const nodeObj = {
            name: nodeName,
            address: baseUrl,
            port: port
        };

        return HTTP.post(registryLocation + '/service-registry/', nodeObj)
            .then(data => {
                if (data && data.status && data.status == 200) {
                    return Promise.resolve(data.data);
                }
                return Promise.reject(false);
            });
    };

    this.getAll = (registryLocation) => {
        return HTTP.get(registryLocation + '/service-registry/')
            .then(data => {
                return data;
            })
            .catch(err => {
                Logger.error('Error: ', err);
                return Promise.reject(false);
            });
    };

    this.updateLearnerNode = (registryLocation, nodeName) => {
        return HTTP.post(registryLocation + '/service-registry/updatelearner', { nodeName: nodeName })
            .then(data => {
                if (data && data.status && data.status == 200) {
                    return Promise.resolve(data.data);
                }
                return Promise.reject(false);
            });
    };
};

module.exports = new ServiceRegistry();