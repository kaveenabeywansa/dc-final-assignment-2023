// impl of the bully algorithm
const HTTP = require('../helpers/http-client');
const Broadcaster = require('./broadcaster');
const ServiceRegistry = require('./service-registry');
const Scheduler = require('./scheduler');
const RuntimeDB = require('../schema/runtime-schema');

var Election = function () {

    this.startElection = () => {
        // call off if an election is already run by the node
        if (RuntimeDB.IS_ELECTION_RUNNING) {
            return;
        }

        RuntimeDB.IS_ELECTION_RUNNING = true;
        ServiceRegistry.getAll(RuntimeDB.SERVICE_REGISTRY_URL).then((updatedRegList) => {
            var higherNodeArr = updatedRegList.filter(el => el.nodeName > RuntimeDB.NODE_NAME);
            if (higherNodeArr.length) {
                console.log('Starting election... Higher nodes found:', higherNodeArr.length);
                var promList = [];
                var responseList = [];
                const url = '/broadcast/checkisalive/' + RuntimeDB.NODE_NAME;
                higherNodeArr.forEach(elNode => {
                    let nodeEndPointUrl = elNode.ipAddress + ':' + elNode.portNumber + url;
                    let requestItm = HTTP.get(nodeEndPointUrl)
                    promList.push(requestItm);

                    // handling election statuses
                    requestItm
                        .then(() => {
                            responseList.push({ node: elNode, status: true });
                        }).catch(() => {
                            responseList.push({ node: elNode, status: false });
                        });
                });

                console.log('Waiting for election responses...');
                Promise.all(promList)
                    .catch((error) => {
                        if (error.code && (error.code == 'EHOSTDOWN' || error.code == 'ETIMEDOUT' || error.code == 'ECONNREFUSED')) {
                            console.log('Detected crashed node!');
                        }
                    }).finally(() => {
                        // RuntimeDB.IS_ELECTION_RUNNING = false;
                        // filter higher nodes from the list
                        let higherActNodeList = responseList.filter(_node => _node.status);
                        if (!higherActNodeList.length) {
                            // if no higher node is active
                            let higherInActNodeList = responseList.filter(_node => !_node.status);
                            return this.announceSelfAsLeader(higherInActNodeList);
                        }
                        // if it comes here, the election is over without winning
                        console.log('Calling off election...');
                        RuntimeDB.IS_ELECTION_RUNNING = false;
                    });
            } else {
                // winner
                this.announceSelfAsLeader();
            }
        });
    };

    this.announceSelfAsLeader = (inActNodeList = false) => {
        console.log('Elected as the leader!');
        var promArr = [];

        // deregister inactive higher nodes if any
        if (inActNodeList && inActNodeList.length) {
            let url = RuntimeDB.SERVICE_REGISTRY_URL + '/service-registry/deregister';
            let payload = {
                nodesToRemove: inActNodeList.map(_itm => _itm.node.nodeName)
            };
            promArr.push(HTTP.post(url, payload));
        }

        // registry update leader
        let updateleaderUrl = RuntimeDB.SERVICE_REGISTRY_URL + '/service-registry/updateleader';
        let updateleaderPayload = {
            name: RuntimeDB.NODE_NAME
        };
        promArr.push(HTTP.post(updateleaderUrl, updateleaderPayload));

        // broadcast all nodes on being the leader
        let broadcastReq = ServiceRegistry.getAll(RuntimeDB.SERVICE_REGISTRY_URL)
        promArr.push(broadcastReq);

        broadcastReq.then((dataList) => {
            // remove self from the datalist
            let indx = dataList.findIndex(_regItm => _regItm.nodeName == RuntimeDB.NODE_NAME);
            if (indx >= 0) {
                dataList.splice(indx, 1);
            }

            // send broadcast
            let broadcastUrl = '/broadcast/newLeader';
            let broadcastPayload = {
                name: RuntimeDB.NODE_NAME
            };

            return Broadcaster.broadcastAll(dataList, broadcastUrl, broadcastPayload).catch(()=>{console.log('from here')});
        });

        Promise.all(promArr)
            .then(() => {
                console.log('Election winner announcement complete!');
                Scheduler.startScheduling();
            }).catch((err) => {
                if (!err.code) {
                    console.log('Error', err);
                }
            }).finally(() => {
                RuntimeDB.IS_ELECTION_RUNNING = false;
            });
    };

    this.respondIsAlive = (requesterNode) => {
        return new Promise((resolve, reject) => {
            if (requesterNode < RuntimeDB.NODE_NAME && RuntimeDB.LEADER_NODE_NAME != RuntimeDB.NODE_NAME) {
                console.log('Re starting election by', RuntimeDB.NODE_NAME);
                // election starter node is less than self
                // need to start own election
                this.startElection();
            }

            // respond alive anyway
            resolve({ status: 200, data: true });
        });
    };

    this.checkIsLeaderAlive = () => {
        console.log('checking is leader alive')
        if (RuntimeDB.LEADER_NODE_NAME && RuntimeDB.LEADER_NODE_NAME != RuntimeDB.NODE_NAME) {
            let leaderNode = RuntimeDB.SERVICE_REG_LIST.find(_itm => _itm.nodeName == RuntimeDB.LEADER_NODE_NAME);
            if (leaderNode) {
                const url = leaderNode.ipAddress + ':' + leaderNode.portNumber + '/broadcast/checkisalive';
                HTTP.get(url).catch(error => {
                    if (error.code) {
                        // leader unavailable -> start election
                        this.startElection();
                    }
                });
            }
        }
    };

};

module.exports = new Election();