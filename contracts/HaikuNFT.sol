// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract HaikuNFT is ERC721 {
    error HaikuNotUnique();
    error NotYourHaiku(uint haikuId);
    error NoHaikusShared();

    // counter is incremented after Haiku is minted;
    // current counter is +1 greater that circulating HaikuNFTs
    uint public counter;

    struct Haiku {
        address author;
        string line1;
        string line2;
        string line3;
    }

    Haiku[] public haiku;

    // mapping of address to array of haikues that have been shared with an address
    mapping(address => uint[]) public sharedHaikus;

    /*
    @dev each line used in a haiku must be unique,
    once a line is used in a haiku, we take the stirng of the line,
    convert it into a bytes32 and add it to linesUsed as true. If someone tries to use
    the same line in another haiku, the mintHaiku checks to see if the line has been used
    if used, it will revert with HaikuNotUnique()
     */
    mapping(bytes32 => bool) public linesUsed;

    constructor() ERC721("HaikuNFT", "HNFT") {
        haiku.push(Haiku(address(0), "", "", "")); // burns the 0th haiku
        counter = 1;
    }

    /*
    public mint function - anyone can create a haiku
    params: each line must be unique. to check if a line is unique, we cast it as a bytes32
    and check the linesUsed mapping to see if it has been used (will be true).
    */

    function mintHaiku(
        string calldata _line1,
        string calldata _line2,
        string calldata _line3
    ) external {
        bytes32 bytesOne = bytes32(bytes(_line1));
        bytes32 bytesTwo = bytes32(bytes(_line2));
        bytes32 bytesThree = bytes32(bytes(_line3));
        if (linesUsed[bytesOne] || linesUsed[bytesTwo] || linesUsed[bytesThree])
            revert HaikuNotUnique();
        linesUsed[bytesOne] = true;
        linesUsed[bytesTwo] = true;
        linesUsed[bytesThree] = true;
        _safeMint(msg.sender, counter);
        haiku.push(Haiku(msg.sender, _line1, _line2, _line3));

        counter++;
    }

    // authors of a haiku can share their haiku with an address
    // if the caller is not the author of the haiku, tx will revert
    function shareHaiku(address _to, uint _haikuId) external {
        if (haiku[_haikuId].author != msg.sender) revert NotYourHaiku(_haikuId);
        sharedHaikus[_to].push(_haikuId);
    }

    // returns an array haikus that have been shared will the caller
    // if no one has shared a haiku w/ caller, tx will revert
    function getMySharedHaikus() external view returns (Haiku[] memory) {
        uint arrayLenghth = sharedHaikus[msg.sender].length;
        if (arrayLenghth == 0) revert NoHaikusShared();
        Haiku[] memory haikus = new Haiku[](arrayLenghth);
        for (uint i; i < arrayLenghth; ) {
            haikus[i] = haiku[sharedHaikus[msg.sender][i]];
            unchecked {
                i++;
            }
        }
        return haikus;
    }

    // external function to allow users to see if a line has been used
    function checkLineUsed(string calldata _line) public view returns (bool) {
        return linesUsed[bytes32(bytes(_line))];
    }
}
