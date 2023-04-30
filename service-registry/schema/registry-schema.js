// ServiceRegistry will act as the database with a static variable
module.exports = class ServiceRegistry {
    static registry = [];

    static getRegistry() {
        return this.registry;
    }

    static add(name, address, port) {
        return this.registry.push({
            nodeName: name,
            ipAddress: address,
            portNumber: port,
            isLeader: false,
            isLearner: false
        });
    }

    static updateLeader(nodeName) {
        this.registry.forEach(elInstance => {
            elInstance.isLeader = (elInstance.nodeName == nodeName);
        });
        return true;
    }

    static removeNodes(nodeList) {
        nodeList.forEach(element => {
            let indx = this.registry.findIndex(_regItm => _regItm.nodeName == element);
            if (indx >= 0) {
                this.registry.splice(indx, 1);
            }
        });
    }

    static updateLearner(nodeName) {
        this.registry.forEach(elInstance => {
            elInstance.isLearner = (elInstance.nodeName == nodeName);
        });
        return true;
    }
}