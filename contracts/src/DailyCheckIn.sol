// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Daily check-in on Base. User pays only L2 gas — no ETH sent to contract.
/// @dev Stores `day + 1` per address so day 0 is distinguishable from "never checked".
contract DailyCheckIn {
    /// @notice Encoded day: `0` = never; otherwise `calendarDay + 1`.
    mapping(address => uint256) public lastCheckInDay;
    mapping(address => uint256) public streak;

    event CheckedIn(address indexed user, uint256 day, uint256 newStreak);

    error AlreadyCheckedInToday();
    error ValueNotAllowed();

    function currentDay() public view returns (uint256) {
        return block.timestamp / 1 days;
    }

    function checkIn() external payable {
        if (msg.value != 0) revert ValueNotAllowed();

        uint256 day = currentDay();
        uint256 last = lastCheckInDay[msg.sender];
        uint256 todayCode = day + 1;

        if (last == todayCode) revert AlreadyCheckedInToday();

        uint256 newStreak;
        if (last == 0) {
            newStreak = 1;
        } else if (last == day) {
            // last was (day-1)+1 from yesterday
            newStreak = streak[msg.sender] + 1;
        } else {
            newStreak = 1;
        }

        lastCheckInDay[msg.sender] = todayCode;
        streak[msg.sender] = newStreak;

        emit CheckedIn(msg.sender, day, newStreak);
    }
}
