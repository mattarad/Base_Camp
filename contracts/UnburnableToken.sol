// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

contract UnburnableToken {
    error AllTokensClaimed();
    error TokensClaimed();
    error TransferInProgress();
    error UnsafeTransfer(address _to);
    error InvalidAmount(uint _amount);

    uint public totalSupply;
    uint public totalClaimed;
    uint public claimAmount;
    mapping(address => uint) public balances;
    mapping(address => bool) public hasClaimed;

    mapping(address => bool) private transfering;

    // prevents reentrancy attacks - not necessary for this contract ¯\_(ツ)_/¯
    modifier activeTransfer() {
        if (transfering[msg.sender]) revert TransferInProgress();
        transfering[msg.sender] = true;
        _;
        transfering[msg.sender] = false;
    }

    // constructor sets totalSupply and the amount a user can claim
    constructor() {
        // totalSupply = 100000000;
        totalSupply = 1000000; // for testing

        claimAmount = 1000;
    }

    // allows users to claim tokens one time
    function claim() external {
        if (totalClaimed + claimAmount > totalSupply) revert AllTokensClaimed();
        if (hasClaimed[msg.sender]) revert TokensClaimed();
        hasClaimed[msg.sender] = true;
        totalClaimed += claimAmount;
        balances[msg.sender] += claimAmount;
    }

    // allows users to transfer tokens
    function safeTransfer(address _to, uint _amount) external activeTransfer {
        if (_to == address(0) || address(_to).balance == 0)
            revert UnsafeTransfer(_to);
        if (balances[msg.sender] >= _amount) {
            balances[msg.sender] -= _amount;
            balances[_to] += _amount;
        } else {
            revert InvalidAmount(_amount);
        }
    }
}
