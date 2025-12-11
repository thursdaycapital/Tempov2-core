// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title BatchTransfer
 * @dev Minimal batch transfer helper for ERC20 tokens. Sender must have approved this contract.
 */
contract BatchTransfer {
    /**
     * @notice Transfer the same ERC20 token to many recipients.
     * @param token ERC20 token address.
     * @param recipients List of recipient addresses.
     * @param amounts List of amounts (must be same length as recipients).
     */
    function batchTransfer(address token, address[] calldata recipients, uint256[] calldata amounts) external {
        require(recipients.length == amounts.length, "Length mismatch");
        IERC20 erc20 = IERC20(token);
        for (uint256 i = 0; i < recipients.length; i++) {
            require(erc20.transferFrom(msg.sender, recipients[i], amounts[i]), "transfer failed");
        }
    }
}
