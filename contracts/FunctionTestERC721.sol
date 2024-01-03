// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract FunctionTestERC721 is ERC721 {
    uint public totalSupply;

    mapping(address => uint[]) public owned;

    constructor() ERC721("Function Testing", "FTERC") {}

    function mint(uint256 _amount) external {
        for (uint i = 0; i < _amount; ) {
            unchecked {
                totalSupply++;
            }
            _mint(msg.sender, totalSupply);
            owned[msg.sender].push(totalSupply);
            unchecked {
                i++;
            }
        }
    }

    function safeBatchTransfer(address _to, uint[] memory _tokens) external {
        for (uint i = 0; i < _tokens.length; ) {
            transferFrom(msg.sender, _to, _tokens[i]);
            owned[_to].push(_tokens[i]);
            unchecked {
                i++;
            }
        }
        _updateOwned(msg.sender, _tokens);
    }

    function _updateOwned(address _address, uint[] memory _tokens) internal {
        uint length = owned[_address].length;
        uint tokenLength = _tokens.length;
        uint minusLength = length - tokenLength;
        uint[] memory newOwned = new uint[](minusLength);
        uint counter;
        for (uint i = 0; i < length; ) {
            bool _bloop = false;
            for (uint j = 0; j < tokenLength; ) {
                if (owned[_address][i] == _tokens[j]) _bloop = true;
                unchecked {
                    j++;
                }
            }
            if (_bloop) {
                unchecked {
                    i++;
                }
                _bloop = true;
                continue;
            } else {
                newOwned[counter] = owned[_address][i];
                unchecked {
                    i++;
                    counter++;
                }
            }
            // console.log(i);
            // console.log(counter);
        }
        owned[_address] = newOwned;
    }

    function getOwned(address _address) external view returns (uint[] memory) {
        return owned[_address];
    }
}
