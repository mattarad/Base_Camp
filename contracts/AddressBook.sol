// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AddressBook is Ownable {
    error ContactNotFound(uint _id);

    uint public contactCount;

    struct Contact {
        uint id;
        string firstName;
        string lastName;
        uint[] phoneNumbers;
    }
    /*
    array of owner's contacts
    can add a contact by calling addContact - id is derived from contactCounter - contactCounter is incremented before
    can delete a contact by calling deleteContact(uint _id) deletes the contact at the location of _id
    in contacts array, then reorganized array;
    */
    Contact[] public contacts;

    constructor(address _sender) Ownable(_sender) {}

    function addContact(
        string calldata _firstName,
        string calldata _lastName,
        uint[] calldata _phoneNumbers
    ) external onlyOwner {
        contactCount++;
        contacts.push(
            Contact(contactCount, _firstName, _lastName, _phoneNumbers)
        );
    }

    // _id param is the index of the contact in the contacts array
    function getContact(uint _id) external view returns (Contact memory) {
        return contacts[_id];
    }

    function getAllContacts() external view returns (Contact[] memory) {
        return contacts;
    }

    function getContactsLength() external view returns (uint) {
        return contacts.length;
    }

    // _id param is the index of the contact in the contacts array
    function deleteContact(uint _id) external onlyOwner {
        if (_id >= contacts.length) revert ContactNotFound(_id);
        delete contacts[_id];
        _organizeContacts(_id);
    }

    function _organizeContacts(uint _id) internal {
        uint counter = contacts.length - 1;
        Contact[] memory tempContacts = contacts;
        for (uint i = _id; i < counter; i++) {
            contacts[i] = tempContacts[i + 1];
        }
        contacts.pop();
    }
}

contract AddressBookFactory {
    function deploy() external returns (address) {
        AddressBook newContract = new AddressBook(msg.sender);
        return address(newContract);
    }
}
