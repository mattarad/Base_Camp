// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

contract ArraysExercise {
    uint[] public numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    uint[] public timestamps;

    address[] public senders;

    function getNumbers() external view returns (uint[] memory) {
        return numbers;
    }

    function resetNumbers() external {
        numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    }

    function appendToNumbers(uint[] calldata _toAppend) external {
        uint _counter = _toAppend.length;
        for (uint i; i < _counter; i++) {
            numbers.push(_toAppend[i]);
        }
    }

    function saveTimestamp(uint _unixTimestamp) external {
        senders.push(msg.sender);
        timestamps.push(_unixTimestamp);
    }

    function afterY2K()
        external
        view
        returns (uint[] memory, address[] memory)
    {
        uint y2kStamp = 946702800;
        uint _arrayLength = _returnArraySize();
        uint[] memory timeStampsArray = new uint[](_arrayLength);
        address[] memory sendersArray = new address[](_arrayLength);
        uint _counter;
        for (uint i; i < timestamps.length; i++) {
            if (timestamps[i] > y2kStamp) {
                timeStampsArray[_counter] = timestamps[i];
                sendersArray[_counter] = senders[i];
                _counter++;
            }
        }
        return (timeStampsArray, sendersArray);
    }

    function getSendersLength() external view returns (uint) {
        return senders.length;
    }

    function getTimestampsLength() external view returns (uint) {
        return timestamps.length;
    }

    function resetTimestampsAndSenders() external {
        if (senders.length != timestamps.length)
            revert("Array lengths do not match, reset using individual funcs.");
        uint _arrayLength = senders.length;
        for (uint i; i < _arrayLength; i++) {
            senders.pop();
            timestamps.pop();
        }
    }

    function resetSenders() public {
        uint _arrayLength = senders.length;
        for (uint i; i < _arrayLength; i++) {
            senders.pop();
        }
    }

    function resetTimestamps() public {
        uint _arrayLength = timestamps.length;
        for (uint i; i < _arrayLength; i++) {
            timestamps.pop();
        }
    }

    function _returnArraySize() internal view returns (uint _counter) {
        uint y2kStamp = 946702800;
        for (uint i; i < timestamps.length; i++) {
            if (timestamps[i] > y2kStamp) _counter++;
        }
        return _counter;
    }
}
