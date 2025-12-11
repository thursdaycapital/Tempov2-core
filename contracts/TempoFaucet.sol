// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMintableERC20 {
    function mint(address to, uint256 amount) external;
}

contract TempoFaucet {
    function mint(address token, uint256 amount) public {
        IMintableERC20(token).mint(msg.sender, amount);
    }
}
