const HTTP = require('../helpers/http-client');
const ServiceRegistry = require('./service-registry');
const RuntimeDB = require('../schema/runtime-schema');
const Logger = require('../helpers/logger');

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

    this.newLearnerNode = (node, count) => {
        let nodeEndPointUrl = node.ipAddress + ':' + node.portNumber + '/broadcast/task-update-learner';
        return HTTP.post(nodeEndPointUrl, { proposerCount: count });
    };

    this.distributeTaskToProposer = (taskObj) => {
        let nodeEndPointUrl = taskObj.ipAddress + ':' + taskObj.portNumber + '/broadcast/task-proposer';
        return HTTP.post(nodeEndPointUrl, taskObj);
    };

    this.sendResultToAcceptor = (acceptorNode, payload) => {
        Logger.log('sending result to accepter...');
        let nodeEndPointUrl = acceptorNode.ipAddress + ':' + acceptorNode.portNumber + '/broadcast/task-accepter';
        return HTTP.post(nodeEndPointUrl, payload);
    };

    this.sendResultToLearner = (payload) => {
        Logger.log('sending result to learner...');
        ServiceRegistry.getAll(RuntimeDB.SERVICE_REGISTRY_URL).then((updatedRegList) => {
            let learnerNode = updatedRegList.find(_itm => _itm.isLearner);
            let nodeEndPointUrl = learnerNode.ipAddress + ':' + learnerNode.portNumber + '/broadcast/task-learner';
            HTTP.post(nodeEndPointUrl, payload);
        });
    };

    this.finishLearntTask = (payload) => {
        Logger.log('sending result to leader...');
        ServiceRegistry.getAll(RuntimeDB.SERVICE_REGISTRY_URL).then((updatedRegList) => {
            let leaderNode = updatedRegList.find(_itm => _itm.nodeName == RuntimeDB.LEADER_NODE_NAME);
            let nodeEndPointUrl = leaderNode.ipAddress + ':' + leaderNode.portNumber + '/broadcast/task-finalized';
            HTTP.post(nodeEndPointUrl, payload);
        });
    };
};

module.exports = new Broadcaster();