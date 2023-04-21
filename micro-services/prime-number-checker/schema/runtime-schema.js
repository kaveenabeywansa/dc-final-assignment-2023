// RuntimeDB will act as the database with a static variable
module.exports = class RuntimeDB {
    static SERVICE_REGISTRY_URL;
    static NODE_NAME;
    static SERVICE_REG_LIST = [];
    static LEADER_NODE_NAME;
}