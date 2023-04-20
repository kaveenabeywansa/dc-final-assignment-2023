const axios = require('axios');
const PROTOCOL = 'http://';

var HTTP = function () {

    this.get = (url) => {
        return axios.get(PROTOCOL + url)
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