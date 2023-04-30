// RuntimeDB will act as the database with a static variable
module.exports = class RuntimeDB {
    static SERVICE_REGISTRY_URL;
    static SIDE_CAR_LOGGER_URL;
    static NODE_NAME;
    static SERVICE_REG_LIST = [];
    static LEADER_NODE_NAME;
    static IS_ELECTION_RUNNING = false;
    static SCHEDULED_TASK;
    static SCHEDULED_TASK_RUNNING = 0;
    static ROLE_LIST = [];
    static LEARNER_SCHEDULE = {
        PROPOSER_COUNT: 0,
        RESPONSES: [],
    };
}