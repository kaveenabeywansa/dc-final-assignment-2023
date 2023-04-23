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
            Promise.resolve(data);
        })
    };

    this.newLeaderUpdate = (reqBody) => {
        RuntimeDB.LEADER_NODE_NAME = reqBody.name;
    };

};

module.exports = new Broadcaster();