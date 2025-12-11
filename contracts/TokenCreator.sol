// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MockERC20.sol";

contract TokenCreator {
    event TokenCreated(address indexed token, string name, string symbol, address indexed creator);

    function createToken(string memory name, string memory symbol, uint256 initialSupply) public returns (address) {
        // Deploy new token
        MockERC20 newToken = new MockERC20(name, symbol);
        
        // The MockERC20 constructor mints 1B tokens to msg.sender (which is this contract)
        uint256 factoryBalance = newToken.balanceOf(address(this));
        
        // Transfer all initial tokens to the user
        newToken.transfer(msg.sender, factoryBalance);
        
        // If user requested specific supply that differs from 1B, we can adjust (if mint is public)
        // Since mint is public in MockERC20:
        if (initialSupply > factoryBalance) {
            newToken.mint(msg.sender, initialSupply - factoryBalance);
        }
        // If they want less, they can burn, but we'll just give them at least the 1B default or the requested amount.
        // For simplicity, let's just ensure they get *at least* what they asked for, or just the default.
        // Actually, the simplest UX is: "Create Token" -> You get 1 Billion.
        // But let's support the `initialSupply` param to mint extra if needed.
        
        emit TokenCreated(address(newToken), name, symbol, msg.sender);
        return address(newToken);
    }
}
