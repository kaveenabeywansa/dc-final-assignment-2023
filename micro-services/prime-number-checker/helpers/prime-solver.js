var PrimeSolver = function () {

    this.isPrime = (numberToCheck, floorNumber, ceilNumber) => {
        var returnResp = {
            result: true,
            divisibleBy: undefined
        };
        
        for (var i = floorNumber; i < ceilNumber && returnResp.result; i++) {
            if (i == 1) {
                continue;
            }
        
            if (!(numberToCheck % i)) {
                returnResp.result = false;
                returnResp.divisibleBy = i;
            }
        }

        return returnResp;
    };

    this.isDivisibleBy = (numberToCheck, divideBy) => {
        return (numberToCheck % divideBy) == 0;
    };

};

module.exports = new PrimeSolver();