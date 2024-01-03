// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

import "./SillyStringUtils.sol";

contract ImportsExercise {
    using SillyStringUtils for SillyStringUtils.Haiku;

    SillyStringUtils.Haiku public haiku;

    function saveHaiku(
        string calldata _stringOne,
        string calldata _stringTwo,
        string calldata _stringThree
    ) external {
        haiku = SillyStringUtils.Haiku(_stringOne, _stringTwo, _stringThree);
    }

    function getHaiku() external view returns (SillyStringUtils.Haiku memory) {
        return haiku;
    }

    function shruggieHaiku()
        external
        view
        returns (SillyStringUtils.Haiku memory)
    {
        return
            SillyStringUtils.Haiku(
                haiku.line1,
                haiku.line2,
                SillyStringUtils.shruggie(haiku.line3)
            );
    }
}
