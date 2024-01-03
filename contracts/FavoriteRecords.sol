// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

contract FavoriteRecords {
    error NotApproved(string _albumName);
    // admin set in constructer as msg.sender
    address public admin;
    // array of approved records
    string[] public approvedRecordsArray;

    // record name -> isApproved
    mapping(string => bool) public approvedRecords;
    // user address => record names => bool for is user favorite
    mapping(address => mapping(string => bool)) public userFavorites;

    constructor() {
        admin = msg.sender;
        setApprovedRecords("Thriller");
        setApprovedRecords("Back in Black");
        setApprovedRecords("The Bodyguard");
        setApprovedRecords("The Dark Side of the Moon");
        setApprovedRecords("Their Greatest Hits (1971-1975)");
        setApprovedRecords("Hotel California");
        setApprovedRecords("Come On Over");
        setApprovedRecords("Rumours");
        setApprovedRecords("Saturday Night Fever");
    }

    // only allows admin to call certain functions
    modifier onlyAdmin() {
        if (msg.sender != admin) revert("SENDER NOT ADMIN");
        _;
    }

    //allows admin to set approvals for an array of records
    function setApprovedRecordsArray(
        string[] memory _records
    ) public onlyAdmin {
        for (uint i; i < _records.length; i++) {
            setApprovedRecords(_records[i]);
        }
    }

    // returns an array of approved records
    function getApprovedRecords() external view returns (string[] memory) {
        string[] memory result = new string[](approvedRecordsArray.length);
        for (uint i; i < approvedRecordsArray.length; i++) {
            result[i] = approvedRecordsArray[i];
        }
        return result;
    }

    // sets userFavorites of the user and album name to true
    function addRecord(string calldata _albumName) external {
        if (!approvedRecords[_albumName]) revert NotApproved(_albumName);
        userFavorites[msg.sender][_albumName] = true;
    }

    // returns an array of record names the user has favorited
    function getUserFavorites(
        address _user
    ) external view returns (string[] memory result) {
        result = new string[](_getUserFavoriteCount(_user));
        uint256 recordsArrayLength = approvedRecordsArray.length;
        uint _counter;
        for (uint i; i < recordsArrayLength; ) {
            if (userFavorites[_user][approvedRecordsArray[i]]) {
                result[_counter] = approvedRecordsArray[i];
                unchecked {
                    i++;
                    _counter++;
                }
            } else {
                unchecked {
                    i++;
                }
            }
        }
    }

    // sets all records to false
    function resetUserFavorites() external {
        uint256 recordsArrayLength = approvedRecordsArray.length;
        for (uint i; i < recordsArrayLength; ) {
            userFavorites[msg.sender][approvedRecordsArray[i]] = false;
            unchecked {
                i++;
            }
        }
    }

    // INTERNAL FUNCTIONS

    // internal function for approving records one at a time
    function setApprovedRecords(string memory _record) internal {
        if (!approvedRecords[_record]) approvedRecordsArray.push(_record);
        approvedRecords[_record] = true;
    }

    // returns the number of favorites a user has - internal
    function _getUserFavoriteCount(
        address _user
    ) internal view returns (uint256 count) {
        uint256 recordsArrayLength = approvedRecordsArray.length;
        for (uint i; i < recordsArrayLength; ) {
            if (userFavorites[_user][approvedRecordsArray[i]]) {
                unchecked {
                    i++;
                    count++;
                }
            } else {
                unchecked {
                    i++;
                }
            }
        }
    }
}
