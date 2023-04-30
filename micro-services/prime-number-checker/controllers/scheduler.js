const HTTP = require('../helpers/http-client');
const ServiceRegistry = require('./service-registry');
const CommonFns = require('../helpers/common-fns');
const PrimeSolver = require('../helpers/prime-solver');
const Broadcaster = require('./broadcaster');
const RuntimeDB = require('../schema/runtime-schema');

var Scheduler = function () {

    this.startScheduling = () => {
        if (RuntimeDB.NODE_NAME != RuntimeDB.LEADER_NODE_NAME || RuntimeDB.SCHEDULED_TASK) {
            // end process if not leader
            return;
        }
        this.assignNodeRoles().then((roleList) => {
            // console.log('roleList', roleList);
            var taskBreakDown = this.taskBreakdown(roleList);
            // console.log('task breakdown', taskBreakDown);
            RuntimeDB.SCHEDULED_TASK = taskBreakDown;
            RuntimeDB.SCHEDULED_TASK_RUNNING = 0;
            RuntimeDB.ROLE_LIST = roleList;

            // distribute the tasks to nodes
            this.distributeTasks();
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
                    switch (index) {
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

                let nodeTask = { ..._node, nodeFloor: nodeFloor, nodeCeil: nodeCeil, numberToCheck: _num };
                taskScheduleArr[checkerIndex].push(nodeTask);
            });
        });

        return taskScheduleArr;
    };

    this.distributeTasks = () => {
        let promArray = [];

        // update learner
        let learnerN = RuntimeDB.ROLE_LIST.find(_itm => _itm.role == 'learner');
        let proposerNs = RuntimeDB.ROLE_LIST.filter(_itm => _itm.role == 'proposer');
        promArray.push(Broadcaster.newLearnerNode(learnerN, proposerNs.length));

        // update registry
        promArray.push(ServiceRegistry.updateLearnerNode(RuntimeDB.SERVICE_REGISTRY_URL, learnerN.nodeName));

        // update proposers
        RuntimeDB.SCHEDULED_TASK[RuntimeDB.SCHEDULED_TASK_RUNNING].forEach(_itm => {
            promArray.push(Broadcaster.distributeTaskToProposer({ ..._itm, roleList: RuntimeDB.ROLE_LIST }));
        });

        Promise.all(promArray)
            .then(() => {
                console.log('Schedule distributed!');
            })
            .catch((err) => {
                console.log('Scheduling error');
            });
    };

    // perform the task of the proposer node
    // will handle the full lifecycle of a proposer node
    this.acceptProposerTask = (schedule, retry = 3) => {
        let result = PrimeSolver.isPrime(schedule.numberToCheck, schedule.nodeFloor, schedule.nodeCeil);

        let acceptorList = schedule.roleList.filter(_itm => _itm.role == 'accepter');
        let randomIndx = Math.floor(Math.random() * acceptorList.length);
        let selectedAcceptor = acceptorList[randomIndx];

        let payload = { result: result, schedule: schedule, solvedBy: RuntimeDB.NODE_NAME };
        Broadcaster.sendResultToAcceptor(selectedAcceptor, payload).catch((err) => {
            if (err.code && err.code == 406) {
                // retry 3 times if failed
                if (retry > 0) {
                    this.acceptProposerTask(schedule, (retry - 1));
                }
            }
        });
    };

    // perform the task of an accepter
    this.acceptAccepterTask = (payload) => {
        return new Promise((resolve, reject) => {
            if (payload.result.result) {
                // re-calc and see the whole range
                if (PrimeSolver.isPrime(payload.schedule.numberToCheck, payload.schedule.nodeFloor, payload.schedule.nodeCeil)) {
                    Broadcaster.sendResultToLearner(payload);
                    resolve(true);
                } else {
                    reject(false);
                }
            } else {
                // just check against the divisible number to reduce the overhead
                if (PrimeSolver.isDivisibleBy(payload.schedule.numberToCheck, payload.result.divisibleBy)) {
                    Broadcaster.sendResultToLearner(payload);
                    resolve(true);
                } else {
                    reject(false);
                }
            }
        });
    };

    // accepting the role as a learner
    this.acceptLearnerTask = (payload) => {
        RuntimeDB.LEARNER_SCHEDULE.PROPOSER_COUNT = payload.proposerCount;
        RuntimeDB.LEARNER_SCHEDULE.RESPONSES = [];
    };

    // accepting responses from accepters
    this.acceptLearningResps = (payload) => {
        RuntimeDB.LEARNER_SCHEDULE.RESPONSES.push(payload);
        if (RuntimeDB.LEARNER_SCHEDULE.RESPONSES.length == RuntimeDB.LEARNER_SCHEDULE.PROPOSER_COUNT) {
            // have received all responses
            let isPrime = !(RuntimeDB.LEARNER_SCHEDULE.RESPONSES.map(_itm => _itm.result.result).includes(false));
            let divisibleBy = RuntimeDB.LEARNER_SCHEDULE.RESPONSES.find(_itm => _itm.result.divisibleBy);
            let newBody = {
                isPrime: isPrime,
                divisibleBy: divisibleBy && divisibleBy.result.divisibleBy,
                responses: RuntimeDB.LEARNER_SCHEDULE.RESPONSES
            };
            Broadcaster.finishLearntTask(newBody);
        }
    };

    this.finalizeTask = (payload) => {
        console.log('Task finalized!');
        let numbToChk = payload.responses[0].schedule.numberToCheck;
        let isPrime = payload.isPrime;
        let divisibleBy = payload.divisibleBy;
        let msg = numbToChk + ' is ' + (isPrime ? 'a' : 'not a') + ' prime number!' + (!isPrime ? " Divisible by: " + divisibleBy : '');
        console.log('\x1b[32m' + msg + '\x1b[0m');

        RuntimeDB.SCHEDULED_TASK_RUNNING++;
        if (RuntimeDB.SCHEDULED_TASK_RUNNING < RuntimeDB.SCHEDULED_TASK.length) {
            this.distributeTasks();
        }
    };
};

module.exports = new Scheduler();