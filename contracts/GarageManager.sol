// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

contract GarageManager {
    error BadCarIndex(uint256 _index);
    mapping(address => Car[]) public garage;

    struct Car {
        string make;
        string model;
        string color;
        uint256 numberOfDoors;
    }

    // adds a car with the specified parameters to the callers garage
    function addCar(
        string calldata _make,
        string calldata _model,
        string calldata _color,
        uint256 _numberOfDoors
    ) external {
        garage[msg.sender].push(Car(_make, _model, _color, _numberOfDoors));
    }

    // returns an array of cars listed under the callers garage;
    function getMyCars() external view returns (Car[] memory) {
        return garage[msg.sender];
    }

    // external function that returns an array of cars owned by an address specifid by caller
    function getUserCars(address _user) external view returns (Car[] memory) {
        return garage[_user];
    }

    /*
    user calls to update Car at specified index.
    if index is greater than the user's array of Cars, tx reverts.
    else the car at the specified index will update using the new paramaters.
    */
    function updateCar(
        uint256 _index,
        string calldata _make,
        string calldata _model,
        string calldata _color,
        uint256 _numberOfDoors
    ) external {
        if (_index >= _callIndex()) revert BadCarIndex(_index);
        garage[msg.sender][_index] = Car(_make, _model, _color, _numberOfDoors);
    }

    // deletes garage of sender
    function resetMyGarage() external {
        delete garage[msg.sender];
    }

    // removes car at the _index parameter, then calls internal _reorderGarage to remove deleted element at the _index
    function deleteOneCarFromMyGarage(uint256 _index) external {
        if (_index >= _callIndex()) revert BadCarIndex(_index);
        delete garage[msg.sender][_index];
        _reorderGarage(_index);
    }

    // internal function called by resetMyGarage to remove the deleted car
    function _reorderGarage(uint256 _index) internal {
        uint256 count = _callIndex();
        uint256 _counter;
        Car[] memory cars = garage[msg.sender];
        for (uint256 i; i < count; i++) {
            if (i == _index) {
                continue;
            } else {
                garage[msg.sender][_counter] = cars[i];
                _counter++;
            }
        }
        garage[msg.sender].pop();
    }

    // internal function that returns the length of the senders Car array - the amount of cars the sender has.
    function _callIndex() internal view returns (uint256) {
        return garage[msg.sender].length;
    }
}
