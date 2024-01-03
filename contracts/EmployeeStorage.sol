// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

contract EmployeeStorage {
    uint16 shares;
    uint24 salary;
    uint256 public idNumber;
    string public name;

    error TooManyShares(uint16 _shares);

    constructor(
        uint16 _shares,
        uint24 _salary,
        uint256 _idNumber,
        string memory _name
    ) {
        shares = _shares;
        salary = _salary;
        idNumber = _idNumber;
        name = _name;
    }

    function viewSalary() external view returns (uint24) {
        return salary;
    }

    function viewShares() external view returns (uint16) {
        return shares;
    }

    // Add the provided number of shares to the shares
    // If this would result in more than 5000 shares, revert with a custom error called TooManyShares that returns the number of shares the employee would have with the new amount added
    // If the number of _newShares is greater than 5000, revert with a string message, "Too many shares"

    function grantShares(uint16 _newShares) external {
        if (_newShares > 5000) revert("Too many shares");
        shares += _newShares;
        if (shares > 5000) revert TooManyShares(shares);
    }

    /**
     * Do not modify this function.  It is used to enable the unit test for this pin
     * to check whether or not you have configured your storage variables to make
     * use of packing.
     *
     * If you wish to cheat, simply modify this function to always return `0`
     * I'm not your boss ¯\_(ツ)_/¯
     *
     * Fair warning though, if you do cheat, it will be on the blockchain having been
     * deployed by you wallet....FOREVER!
     */
    function checkForPacking(uint _slot) public view returns (uint r) {
        assembly {
            r := sload(_slot)
        }
    }

    /**
     * Warning: Anyone can use this function at any time!
     */
    function debugResetShares() public {
        shares = 1000;
    }
}
