// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

abstract contract Employee {
    uint public idNumber;
    uint public managerId;

    constructor(uint initIdNumber, uint initManagerId) {
        idNumber = initIdNumber;
        managerId = initManagerId;
    }

    function getAnnualCost() public view virtual returns (uint);
}

contract Salaried is Employee {
    uint public annualSalary;

    constructor(
        uint initIdNumber,
        uint initManagerId,
        uint initAnnualSalary
    ) Employee(initIdNumber, initManagerId) {
        annualSalary = initAnnualSalary;
    }

    function getAnnualCost() public view override returns (uint) {
        return annualSalary;
    }
}

contract Hourly is Employee {
    uint public hourlyRate;

    constructor(
        uint initIdNumber,
        uint initManagerId,
        uint initHourlyRate
    ) Employee(initIdNumber, initManagerId) {
        hourlyRate = initHourlyRate;
    }

    function getAnnualCost() public view override returns (uint) {
        return hourlyRate * 2080;
    }
}

contract Manager is Salaried {
    uint[] public employeeIds;

    constructor(
        uint initIdNumber,
        uint initManagerId,
        uint initAnnualSalary
    ) Salaried(initIdNumber, initManagerId, initAnnualSalary) {}

    function addReport(uint _newId) external {
        employeeIds.push(_newId);
    }

    function resetReports() external {
        delete employeeIds;
    }
}

contract Salesperson is Hourly {
    constructor(
        uint initIdNumber,
        uint initManagerId,
        uint initHourlyRate
    ) Hourly(initIdNumber, initManagerId, initHourlyRate) {}
}

contract EngineeringManager is Manager {
    constructor(
        uint initIdNumber,
        uint initManagerId,
        uint initAnnualSalary
    ) Manager(initIdNumber, initManagerId, initAnnualSalary) {}
}

contract InheritanceSubmission {
    address public salesPerson;
    address public engineeringManager;

    constructor(address _salesPerson, address _engineeringManager) {
        salesPerson = _salesPerson;
        engineeringManager = _engineeringManager;
    }
}
