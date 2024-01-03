// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

contract ControlStructures {
    error AfterHours(uint256 _time);

    function fizzBuzz(uint256 _number) external pure returns (string memory) {
        if (_number % 3 == 0 && _number % 5 == 0) return "FizzBuzz";
        else if (_number % 3 == 0) return "Fizz";
        else if (_number % 5 == 0) return "Buzz";
        else return "Splat";
    }

    function doNotDisturb(uint256 _time) external pure returns (string memory) {
        assert(_time < 2400);

        if (_time >= 1200 && _time <= 1259) revert("At Lunch!");
        else if (_time >= 800 && _time <= 1199) return "Morning!";
        else if (_time >= 1300 && _time <= 1799) return "Afternoon!";
        else if (_time >= 1800 && _time <= 2200) return "Evening!";
        else revert AfterHours(_time);
    }
}
