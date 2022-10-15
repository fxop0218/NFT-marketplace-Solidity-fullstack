// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// Error
error NftMarketplace__NotEnoughEthM();
error NftMarketplace__NotApprovedNft();
error NftMarketplace__NotOwnerOfNft();
error NftMarketplace__NoProceeds();
error NftMarketplace__TranferFailed();
error NftMarketplace__PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
error NftMarketplace__AlreadyListed(address nftAddress, uint256 tokenUri);
error NftMarketplace__NotListed(address nftAddress, uint256 tokenId);

contract NftMarketplace is ReentrancyGuard {
    /*
    `listNft`
    `buyItem`: Buy nft
    `cancelItem`:  Cancel a listing
    `updateListing`: Update the price of the nft
    `withdrawProceeds`: Withdraw payment for my bought NFTs
    */
    // events
    event ItemList(
        address indexed nftSender,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event NftCanceled(address indexed owner, address indexed nftAddress, uint256 indexed tokneId);

    // Structures
    struct Listing {
        uint256 price;
        address seller;
    }

    // Variables
    // Nft address => nft tokenId => Listing
    mapping(address => mapping(uint256 => Listing)) private s_listings;
    mapping(address => uint256) private s_proceeds;

    // Modifiers

    modifier notListed(
        address nftAddress,
        uint256 tokenUri,
        address owner
    ) {
        Listing memory listing = s_listings[nftAddress][tokenUri];
        if (listing.price > 0) {
            revert NftMarketplace__AlreadyListed(nftAddress, tokenUri);
        }
        _;
    }

    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price <= 0) {
            revert NftMarketplace__NotListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isOwner(
        address nftAddress,
        uint256 tokenUri,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenUri);
        if (owner != spender) {
            revert NftMarketplace__NotOwnerOfNft();
        }
        _;
    }

    // Functions

    /*
     * @notice Method for list a nft on marketpalce
     * @param nftAddress: Addres of the nft
     * @param tokenId: The token id of the nft
     * @param price: price of the nft
     *
     */
    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) external notListed(nftAddress, tokenId, msg.sender) isOwner(nftAddress, tokenId, msg.sender) {
        if (price <= 0) {
            // pirce need be more than 0
            revert NftMarketplace__NotEnoughEthM();
        }
        // Send the nft to the contract. Transfer ==> contract "hold" the NFT.
        // Owners can still hold their nft, and give the market approval to sell it
        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(tokenId) != address(this)) {
            // Returns the account approved for `tokenId` token.
            revert NftMarketplace__NotApprovedNft();
        }
        s_listings[nftAddress][tokenId] = Listing(price, msg.sender);
        emit ItemList(msg.sender, nftAddress, tokenId, price);
    }

    // Reentrance vulnavirity diferents ways to do

    /*

function x() {
    require(!loked, "revert")
    loked = true;
    ..
    ..
    ..
    withdraw or pay method...
    loked = false;
}

or use openzeppelin
 */
    function buyNft(address nftAddress, uint256 tokenId)
        external
        payable
        nonReentrant
        isListed(nftAddress, tokenId)
    {
        Listing memory listedItem = s_listings[nftAddress][tokenId];
        if (msg.value < listedItem.price) {
            revert NftMarketplace__PriceNotMet(nftAddress, tokenId, listedItem.price);
        }
        s_proceeds[listedItem.seller] = s_proceeds[listedItem.seller] + msg.value;
        delete (s_listings[nftAddress][tokenId]); // remove the mapping
        IERC721(nftAddress).safeTransferFrom(listedItem.seller, msg.sender, tokenId); // use safeTransferFrom better than transferFrom
        // Check if make sure the nft was transfered
        emit ItemBought(msg.sender, nftAddress, tokenId, listedItem.price);
    }

    function cancelListing(address nftAddress, uint256 tokenId)
        external
        isListed(nftAddress, tokenId)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        delete (s_listings[nftAddress][tokenId]);
        emit NftCanceled(msg.sender, nftAddress, tokenId);
    }

    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    ) external isListed(nftAddress, tokenId) isOwner(nftAddress, tokenId, msg.sender) {
        s_listings[nftAddress][tokenId].price = newPrice;
        emit ItemList(msg.sender, nftAddress, tokenId, newPrice);
    }

    function withdrawc() external nonReentrant {
        uint256 proceeds = s_proceeds[msg.sender];
        if (proceeds <= 0) {
            revert NftMarketplace__NoProceeds();
        }
        s_proceeds[msg.sender] = 0; // Necessary to put this here to avoid the vulnavirity of Reentrance.
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        if (!success) {
            revert NftMarketplace__TranferFailed();
        }
    }

    // getter

    function getListing(address nftAddress, uint256 tokenId)
        external
        view
        returns (Listing memory)
    {
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }
}
