// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

contract BasicMath {
    function adder(
        uint256 _a,
        uint256 _b
    ) external pure returns (uint256 sum, bool error) {
        error = false;
        assembly {
            sum := add(_a, _b)
            if gt(_a, sum) {
                error := true
                sum := 0
            }
        }
        return (sum, error);
    }

    function subtractor(
        uint256 _a,
        uint256 _b
    ) external pure returns (uint256 sum, bool error) {
        error = false;
        assembly {
            sum := sub(_a, _b)
            if lt(_a, sum) {
                error := true
                sum := 0
            }
        }
        return (sum, error);
    }
}
