const axios = require('axios');
const PROTOCOL = 'http://';

// using custom smaller timeout to run the flow quicker
const CUSTOM_TIMEOUT = 10000;

var HTTP = function () {

    this.get = (url) => {
        return axios.get(PROTOCOL + url, { timeout: CUSTOM_TIMEOUT })
            .then(res => {
                return res.data;
            });
    };

    this.post = (url, body) => {
        return axios.post(PROTOCOL + url, body)
            .then(function (response) {
                return response;
            });
    };
};

module.exports = new HTTP();