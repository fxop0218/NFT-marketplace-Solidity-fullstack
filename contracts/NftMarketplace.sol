// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// ERROR
error NftMarketplace__NotOwnerOff();
error NftMarketplace__IsListed(address nftAddress, uint256 tokenId);
error NftMarketplace__NotListed(address nftAddress, uint256 tokenId);
error NftMarketplace__InsufficientAmountToWithdraw();
error NftMarketplace__InsufficientPrice();
error NftMarketplace__NoApprovedNft();
error NftMarketplace__WithdrawError();
error NftMarketplace__YourProperty(
    address nftAddress,
    uint256 tokenId,
    address seller
);
error NftMarketplace__PriceNotMet(
    address nftAddress,
    uint256 tokenId,
    uint256 price
);

contract NftMarketplace is ReentrancyGuard {
    // listNft ✔
    // buyItem: Buy nft ✔
    // cancelItem:  Cancel a listing ✔
    // updateListing: Update the price of the nft ✔
    // withdrawProceeds: Withdraw payment for my bought NFTs
    // Nft has: contractAddress tokenId price

    // Nft address => nft tokenId => Listing
    mapping(address => mapping(uint256 => Listing)) s_nftList;
    // Proceeds user address => amount of ""money""
    mapping(address => uint256) s_proceeds;

    // Events
    event ItemListed(
        address indexed sellerNft,
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

    event ItemCancelled(
        address indexed owner,
        address indexed nftAddress,
        uint256 indexed tokenId
    );

    // Struct
    struct Listing {
        uint256 price;
        address seller;
    }

    // Modifiers
    // If isn't owner revert
    modifier isOwner(
        address nftAddress,
        uint256 tokenUri,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress); // Get IERC721 from this nftAddress
        address owner = nft.ownerOf(tokenUri); // get owner of tokenUri nft
        if (owner != spender) {
            revert NftMarketplace__NotOwnerOff();
        }
        _;
    }

    // if the NFT is listed reverts
    modifier isNotListed(
        address nftAddress,
        uint256 tokenId,
        address owner
    ) {
        Listing memory list = s_nftList[nftAddress][tokenId];
        if (list.price > 0) {
            revert NftMarketplace__IsListed(nftAddress, tokenId);
        }
        _;
    }

    // Is the nft is not listed revert
    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory list = s_nftList[nftAddress][tokenId];
        if (list.price <= 0) {
            revert NftMarketplace__NotListed(nftAddress, tokenId);
        }
        _;
    }

    // Functions

    // list a nft
    function listNft(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
        public
        isOwner(nftAddress, tokenId, msg.sender)
        isNotListed(nftAddress, tokenId, msg.sender)
    {
        // Price can be > 0
        if (price <= 0) {
            revert NftMarketplace__InsufficientPrice();
        }

        // Create ERC721
        IERC721 nft = IERC721(nftAddress); //https://docs.openzeppelin.com/contracts/3.x/api/token/erc721
        if (nft.getApproved(tokenId) != msg.sender) {
            revert NftMarketplace__NoApprovedNft();
        }
        s_nftList[nftAddress][tokenId] = Listing(price, msg.sender);
        // TODO add to database
        emit ItemListed(nftAddress, msg.sender, tokenId, price);
    }

    // Buy listed nft
    function buyNft(address nftAddress, uint256 tokenId)
        external
        payable
        nonReentrant
        isListed(nftAddress, tokenId)
    {
        // the buyer cannot be the same as the seller
        Listing memory list = s_nftList[nftAddress][tokenId];
        if (list.seller == msg.sender) {
            revert NftMarketplace__YourProperty(
                nftAddress,
                tokenId,
                msg.sender
            );
        }
        // value can't bee menor that price
        if (list.price > msg.value) {
            revert NftMarketplace__PriceNotMet(nftAddress, tokenId, list.price);
        }
        // Transfer value to seller (it is important to do this beforehand because it may be a vulnerability)
        s_proceeds[list.seller] = s_proceeds[list.seller] + msg.value;
        // Get IERC721
        IERC721 nft = IERC721(nftAddress);
        nft.safeTransferFrom(list.seller, msg.sender, tokenId);
        emit ItemBought(msg.sender, nftAddress, tokenId, list.price);
    }

    // Cancell item
    function cancelItem(address nftAddress, uint256 tokenId)
        external
        isListed(nftAddress, tokenId)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        delete (s_nftList[nftAddress][tokenId]);
        emit ItemCancelled(msg.sender, nftAddress, tokenId);
    }

    // Update the price of NFT
    function updateItem(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    )
        external
        isOwner(nftAddress, tokenId, msg.sender)
        isListed(nftAddress, tokenId)
    {
        if (newPrice <= 0) {
            revert NftMarketplace__InsufficientPrice();
        }
        s_nftList[nftAddress][tokenId].price = newPrice;
        emit ItemListed(msg.sender, nftAddress, tokenId, newPrice);
    }

    function withdrawProceeds() external payable nonReentrant {
        uint256 amount = s_proceeds[msg.sender];
        if (amount <= 0) {
            revert NftMarketplace__InsufficientAmountToWithdraw();
        }
        s_proceeds[msg.sender] = 0;
        //payable(msg.sender).transfer(amount); //<= noraml function https://docs.soliditylang.org/en/latest/common-patterns.html#withdrawal-from-contracts
        (bool success, ) = payable(msg.sender).call{value: amount}(""); // <= Low level function
        if (!success) {
            revert NftMarketplace__WithdrawError();
        }
    }
}
