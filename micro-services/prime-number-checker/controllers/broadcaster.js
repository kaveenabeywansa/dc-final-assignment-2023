const HTTP = require('../helpers/http-client');
const RuntimeDB = require('../schema/runtime-schema');

var Broadcaster = function () {

    this.broadcastAll = (serviceRegList, url, payload) => {
        var reqPromList = [];

        serviceRegList.forEach(elNode => {
            let nodeEndPointUrl = elNode.ipAddress + ':' + elNode.portNumber + url;
            reqPromList.push(HTTP.post(nodeEndPointUrl, payload));
        });

        return Promise.all(reqPromList).then((data) => {
            console.log(data);
            Promise.resolve(data);
        }).catch((err) => {
            console.log(err);
            Promise.reject(err);
        });
    };

    this.newLeaderUpdate = (reqBody) => {
        RuntimeDB.LEADER_NODE_NAME = reqBody.name;
    };

};

module.exports = new Broadcaster();