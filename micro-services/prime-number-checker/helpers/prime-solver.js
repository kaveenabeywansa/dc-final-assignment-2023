var PrimeSolver = function () {

    this.isPrime = (numberToCheck, floorNumber, ceilNumber) => {
        var returnResp = {
            result: true,
            divisibleBy: undefined
        };

        // optimizing algorithm
        // optimizer 01
        // check if number is even using last digit
        var lastChar = numberToCheck.toString().slice(-1);
        if (this.isDivisibleBy(lastChar, 2)) {
            returnResp.result = false;
            returnResp.divisibleBy = 2;
            return returnResp;
        }

        // optimizer 02
        // check if last digit is 5
        if (lastChar == '5') {
            returnResp.result = false;
            returnResp.divisibleBy = 5;
            return returnResp;
        }

        // check if number divisible by 3 or 9 -> sum of digits divisible by 3 or 9
        var numberToArr = numberToCheck.toString().split('');
        var sumOfNumbArr = numberToArr.reduce((a, b) => parseInt(a) + parseInt(b), 0);
        if (this.isDivisibleBy(sumOfNumbArr, 3)) {
            returnResp.result = false;
            returnResp.divisibleBy = 3;
            return returnResp;
        } else if (this.isDivisibleBy(sumOfNumbArr, 9)) {
            returnResp.result = false;
            returnResp.divisibleBy = 9;
            return returnResp;
        }

        // loop through dividing the number to check with the range provided
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