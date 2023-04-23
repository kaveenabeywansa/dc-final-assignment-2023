const HTTP = require('../helpers/http-client');
const ServiceRegistry = require('./service-registry');
const CommonFns = require('../helpers/common-fns');
const RuntimeDB = require('../schema/runtime-schema');

var Scheduler = function () {

    this.startScheduling = () => {
        // TODO: impl
        // TODO: assign roles to nodes (learner/acceptor/proposer)
        // TODO: break down task
        // TODO: distribute tasks to all nodes

        this.assignNodeRoles().then((roleList) => {
            console.log('roleList', roleList);
            var taskBreakDown = this.taskBreakdown(roleList);
            console.log('task breakdown', taskBreakDown);
        }).catch((err) => {
            console.log('Scheduling error:', err);
            return false;
        });
    };

    this.assignNodeRoles = () => {
        return ServiceRegistry.getAll(RuntimeDB.SERVICE_REGISTRY_URL).then((data) => {
            let filteredList = data.filter(el => el.nodeName != RuntimeDB.NODE_NAME);
            // sorting in desc to set roles based on nodename
            filteredList.sort((a, b) => b.nodeName - a.nodeName);

            if (filteredList.length > 3) {
                filteredList.forEach((_itm, index) => {
                    switch(index) {
                        case 0:
                            _itm.role = 'learner';
                            break;
                        case 1: case 2:
                            _itm.role = 'accepter';
                            break;
                        default:
                            _itm.role = 'proposer';
                    }
                });
                return Promise.resolve(filteredList);
            } else {
                // need more than 3 nodes to perform the operation
                return Promise.reject('Not enough nodes to perform!');
            }
        });
    };

    this.taskBreakdown = (roleList) => {
        var taskScheduleArr = [];
        let proposerNodes = roleList.filter(_el => _el.role == 'proposer');
        let numbersToCheck = CommonFns.getInputNumberList();

        // create schedule for each number in the list
        numbersToCheck.forEach((_num, checkerIndex) => {
            taskScheduleArr.push([]);
            let _floor = 1;
            let _ceil = Math.ceil(_num / 2);
            let nodeRange = Math.ceil(_ceil / proposerNodes.length);
            
            proposerNodes.forEach((_node, indx) => {
                nodeFloor = _floor + (indx > 0 ? (nodeRange * indx) : 0);
                nodeCeil = nodeFloor + nodeRange;
                nodeCeil = (nodeCeil > _ceil) ? _ceil : nodeCeil;
                nodeCeil = (indx != (proposerNodes.length - 1)) ? (nodeCeil - 1) : nodeCeil;

                let nodeTask = { ..._node, nodeFloor: nodeFloor, checkerCeil: nodeCeil, numberToCheck: _num };
                taskScheduleArr[checkerIndex].push(nodeTask);
            });
        });

        return taskScheduleArr;
    };
};

module.exports = new Scheduler();