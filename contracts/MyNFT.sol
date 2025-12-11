// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title MyNFT
 * @dev Minimal ERC721 with per-token URI, public mint for testnet/demo use.
 */
contract MyNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {}

    /**
     * @notice Mint a new NFT with a custom tokenURI.
     * @param to Receiver of the NFT.
     * @param tokenURI_ Metadata URI (e.g. https://.../metadata.json).
     * @return tokenId of the newly minted NFT.
     */
    function mint(address to, string memory tokenURI_) external returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _safeMint(to, newItemId);
        _setTokenURI(newItemId, tokenURI_);
        return newItemId;
    }

    /**
     * @notice Returns the latest minted tokenId (0 if none).
     */
    function currentTokenId() external view returns (uint256) {
        return _tokenIds.current();
    }
}
