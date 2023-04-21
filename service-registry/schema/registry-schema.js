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
            isLeader: false
        });
    }

    static updateLeader(nodeName) {
        this.registry.forEach(elInstance => {
            elInstance.isLeader = (elInstance.nodeName == nodeName);
        });
        return true;
    }
}