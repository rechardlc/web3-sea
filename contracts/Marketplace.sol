// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./FishNFT.sol";
import "./SEAToken.sol";

/**
 * @title Marketplace
 * @dev SEA GameFi 项目的 NFT 交易市场合约
 */
contract Marketplace is Ownable, ReentrancyGuard {
    // 挂单信息
    struct Listing {
        address seller;    // 卖家地址
        uint256 tokenId;   // NFT ID
        uint256 price;     // SEA 代币价格
        uint256 listedAt;  // 挂单时间戳
        bool active;       // 是否活跃
    }
    
    // 合约地址
    FishNFT public fishNFT;
    SEAToken public seaToken;
    
    // DAO 和流动性池地址
    address public daoTreasury;
    address public liquidityPool;
    
    // 手续费率（基点，10000 = 100%）
    uint256 public constant FEE_BASE = 10000;
    uint256 public constant TOTAL_FEE = 200; // 2% = 200/10000
    uint256 public constant BURN_FEE = 100;   // 1% = 100/10000
    uint256 public constant DAO_FEE = 50;     // 0.5% = 50/10000
    uint256 public constant LP_FEE = 50;      // 0.5% = 50/10000
    
    // 挂单映射
    mapping(uint256 => Listing) public listings; // tokenId => Listing
    mapping(address => uint256[]) public userListings; // user => tokenId[]
    
    // 事件
    event NFTListed(
        address indexed seller,
        uint256 indexed tokenId,
        uint256 price
    );
    
    event NFTSold(
        address indexed seller,
        address indexed buyer,
        uint256 indexed tokenId,
        uint256 price
    );
    
    event ListingCancelled(
        address indexed seller,
        uint256 indexed tokenId
    );
    
    event ListingPriceUpdated(
        uint256 indexed tokenId,
        uint256 oldPrice,
        uint256 newPrice
    );
    
    constructor(
        address _fishNFT,
        address _seaToken,
        address _daoTreasury,
        address _liquidityPool
    ) Ownable(msg.sender) {
        fishNFT = FishNFT(_fishNFT);
        seaToken = SEAToken(_seaToken);
        daoTreasury = _daoTreasury;
        liquidityPool = _liquidityPool;
    }
    
    /**
     * @dev 挂单出售 NFT
     */
    function listNFT(uint256 tokenId, uint256 price) external nonReentrant {
        require(fishNFT.ownerOf(tokenId) == msg.sender, "Not owner");
        require(price > 0, "Price must be greater than 0");
        require(!listings[tokenId].active, "Already listed");
        
        // 转移 NFT 到市场合约
        fishNFT.transferFrom(msg.sender, address(this), tokenId);
        
        // 创建挂单
        listings[tokenId] = Listing({
            seller: msg.sender,
            tokenId: tokenId,
            price: price,
            listedAt: block.timestamp,
            active: true
        });
        
        userListings[msg.sender].push(tokenId);
        
        emit NFTListed(msg.sender, tokenId, price);
    }
    
    /**
     * @dev 购买 NFT
     */
    function buyNFT(uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Not listed");
        require(msg.sender != listing.seller, "Cannot buy own NFT");
        require(seaToken.balanceOf(msg.sender) >= listing.price, "Insufficient SEA");
        
        // 计算手续费
        uint256 burnAmount = (listing.price * BURN_FEE) / FEE_BASE;
        uint256 daoAmount = (listing.price * DAO_FEE) / FEE_BASE;
        uint256 lpAmount = (listing.price * LP_FEE) / FEE_BASE;
        uint256 sellerAmount = listing.price - burnAmount - daoAmount - lpAmount;
        
        // 转移 SEA 代币
        seaToken.transferFrom(msg.sender, address(this), listing.price);
        
        // 销毁手续费（1%）
        seaToken.burn(burnAmount);
        
        // 分配给 DAO（0.5%）
        if (daoAmount > 0 && daoTreasury != address(0)) {
            seaToken.transfer(daoTreasury, daoAmount);
        }
        
        // 分配给流动性池（0.5%）
        if (lpAmount > 0 && liquidityPool != address(0)) {
            seaToken.transfer(liquidityPool, lpAmount);
        }
        
        // 支付给卖家（98%）
        seaToken.transfer(listing.seller, sellerAmount);
        
        // 转移 NFT 给买家
        fishNFT.transferFrom(address(this), msg.sender, tokenId);
        
        // 更新挂单状态
        listing.active = false;
        _removeUserListing(listing.seller, tokenId);
        
        emit NFTSold(listing.seller, msg.sender, tokenId, listing.price);
    }
    
    /**
     * @dev 取消挂单
     */
    function cancelListing(uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Not listed");
        require(listing.seller == msg.sender, "Not seller");
        
        // 返回 NFT 给卖家
        fishNFT.transferFrom(address(this), msg.sender, tokenId);
        
        // 更新挂单状态
        listing.active = false;
        _removeUserListing(msg.sender, tokenId);
        
        emit ListingCancelled(msg.sender, tokenId);
    }
    
    /**
     * @dev 更新挂单价格
     */
    function updateListingPrice(uint256 tokenId, uint256 newPrice) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Not listed");
        require(listing.seller == msg.sender, "Not seller");
        require(newPrice > 0, "Price must be greater than 0");
        
        uint256 oldPrice = listing.price;
        listing.price = newPrice;
        
        emit ListingPriceUpdated(tokenId, oldPrice, newPrice);
        emit NFTListed(msg.sender, tokenId, newPrice);
    }
    
    /**
     * @dev 获取挂单信息
     */
    function getListing(uint256 tokenId) external view returns (Listing memory) {
        return listings[tokenId];
    }
    
    /**
     * @dev 获取用户的所有挂单
     */
    function getUserListings(address user) external view returns (uint256[] memory) {
        return userListings[user];
    }
    
    /**
     * @dev 设置 DAO 资金库地址
     */
    function setDaoTreasury(address _daoTreasury) external onlyOwner {
        require(_daoTreasury != address(0), "Invalid address");
        daoTreasury = _daoTreasury;
    }
    
    /**
     * @dev 设置流动性池地址
     */
    function setLiquidityPool(address _liquidityPool) external onlyOwner {
        require(_liquidityPool != address(0), "Invalid address");
        liquidityPool = _liquidityPool;
    }
    
    /**
     * @dev 移除用户挂单
     */
    function _removeUserListing(address user, uint256 tokenId) internal {
        uint256[] storage tokens = userListings[user];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenId) {
                tokens[i] = tokens[tokens.length - 1];
                tokens.pop();
                break;
            }
        }
    }
}

