const ServiceRegistry = require('../schema/registry-schema.js');

var Controller = function () {

    // register a new node
    this.newRegistry = (reqBody) => {
        return new Promise((resolve, reject) => {
            try {
                var addResp = ServiceRegistry.add(reqBody.name, reqBody.address, reqBody.port);
                if (addResp && addResp > 0) {
                    resolve({ status: 200, message: "Successfully Registered!" });
                } else {
                    reject({ status: 500, message: "Error: " + error });
                }
            } catch (error) {
                reject({ status: 500, message: "Error: " + error });
            }
        });
    };

    // get all nodes registered in service registry
    this.getAll = () => {
        return new Promise((resolve, reject) => {
            try {
                resolve({ status: 200, data: ServiceRegistry.getRegistry() });
            } catch (error) {
                reject({ status: 500, message: "Error: " + error });
            }
        })
    };

    // update the leader node
    this.updateLeaderNode = (reqBody) => {
        return new Promise((resolve, reject) => {
            try {
                ServiceRegistry.updateLeader(reqBody.name);
                resolve({ status: 200, message: "Successfully Updated!" });
            } catch (error) {
                reject({ status: 500, message: "Error: " + error });
            }
        });
    };
};

module.exports = new Controller();