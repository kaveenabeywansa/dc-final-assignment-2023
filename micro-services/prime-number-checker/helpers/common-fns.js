var CommonFns = function () {

    this.getInputNumberList = () => {
        var fs = require('fs')
        var fileName = 'numbers-to-check.txt';
        var fileData = fs.readFileSync(fileName, 'utf8');
        return fileData.toString().split(/\r?\n/);
    };

};

module.exports = new CommonFns();