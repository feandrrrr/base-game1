// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DailyTap {
    mapping(address => uint256) public lastTapDay;

    event DailyTapped(address indexed player, uint256 day);

    function tap() external {
        uint256 day = block.timestamp / 1 days;
        require(lastTapDay[msg.sender] < day, "Already tapped today");
        lastTapDay[msg.sender] = day;
        emit DailyTapped(msg.sender, day);
    }
}
