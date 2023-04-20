var ParamExtractor = function () {

    this.validateParams = (argList) => {
        return (argList && argList.length);
    };

    this.extract = (argList) => {
        if (!this.validateParams(argList)) {
            return undefined;
        }
        return {
            portNumber: this.getPortNumber(argList),
            serviceRegLocation: this.getRegistryAddress(argList)
        };
    };

    this.getPortNumber = (argList) => {
        return argList[0];
    };

    this.getRegistryAddress = (argList) => {
        return argList[1];
    };
};

module.exports = new ParamExtractor();