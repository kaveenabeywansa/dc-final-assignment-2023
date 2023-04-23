const HTTP = require('../helpers/http-client');
const ServiceRegistry = require('./service-registry');
const RuntimeDB = require('../schema/runtime-schema');

var Scheduler = function () {

    this.startScheduling = () => {
        // TODO: impl
        // TODO: assign roles to nodes (learner/acceptor/proposer)
        // TODO: break down task
        // TODO: distribute tasks to all nodes

        this.assignNodeRoles().then((roleList) => {
            console.log('roleList', roleList);
        }).catch((err) => {
            console.log('Error while scheduling!', err);
            return false;
        });
    };

    this.assignNodeRoles = () => {
        // TODO: get the registry list
        // TODO: split the nodes into roles

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
                return Promise.reject(false);
            }
        });
    };

};

module.exports = new Scheduler();