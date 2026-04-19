// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {DailyCheckIn} from "../src/DailyCheckIn.sol";

contract DailyCheckInTest is Test {
    DailyCheckIn internal c;
    address internal alice = address(0xA11ce);

    function setUp() public {
        c = new DailyCheckIn();
        vm.warp(1700000000); // non-zero day bucket for stable tests
    }

    function test_checkIn_firstTime() public {
        uint256 day = block.timestamp / 1 days;
        vm.prank(alice);
        vm.expectEmit(true, true, true, true);
        emit DailyCheckIn.CheckedIn(alice, day, 1);
        c.checkIn();
        assertEq(c.streak(alice), 1);
        assertEq(c.lastCheckInDay(alice), day + 1);
    }

    function test_checkIn_revertsWithValue() public {
        vm.deal(alice, 1 ether);
        vm.expectRevert(DailyCheckIn.ValueNotAllowed.selector);
        vm.prank(alice);
        c.checkIn{value: 1 wei}();
    }

    function test_checkIn_twiceSameDay_reverts() public {
        vm.startPrank(alice);
        c.checkIn();
        vm.expectRevert(DailyCheckIn.AlreadyCheckedInToday.selector);
        c.checkIn();
        vm.stopPrank();
    }

    function test_checkIn_nextDay_incrementsStreak() public {
        vm.startPrank(alice);
        c.checkIn();
        vm.warp(block.timestamp + 1 days);
        c.checkIn();
        assertEq(c.streak(alice), 2);
        vm.stopPrank();
    }

    function test_checkIn_gap_resetsStreak() public {
        vm.startPrank(alice);
        c.checkIn();
        vm.warp(block.timestamp + 2 days);
        c.checkIn();
        assertEq(c.streak(alice), 1);
        vm.stopPrank();
    }
}
