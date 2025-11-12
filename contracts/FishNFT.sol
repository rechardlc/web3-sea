// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FishNFT
 * @dev SEA GameFi 项目的鱼类 NFT 合约
 */
contract FishNFT is ERC721Enumerable, Ownable, ReentrancyGuard {
    // 盲盒销售阶段
    enum BoxPhase {
        Initial,  // 首发阶段
        Public,   // 公售阶段
        Regular   // 常规阶段
    }
    
    // 鱼类属性
    struct FishAttributes {
        uint8 tier;              // Tier: 1, 2, 3
        uint8 starLevel;         // 星级: 0-9
        uint8 durability;        // 耐久度: 0-100
        uint8 rarity;           // 稀有度: 0=普通, 1=稀有, 2=史诗, 3=传说
        uint8 fishType;          // 鱼类种类: 0-8 (9种鱼类)
        uint256 evolutionCount;  // 进化次数
        uint256 totalStakingTime; // 总质押时长
        uint256 combatPower;     // 战斗值（未来扩展）
        uint256 geneSequence;    // 基因序列
        uint256 createdAt;       // 创建时间戳
    }
    
    // 阶段价格
    mapping(BoxPhase => uint256) public phasePrices;
    
    // 阶段限量
    mapping(BoxPhase => uint256) public phaseLimits;
    mapping(BoxPhase => uint256) public phaseSold; // 已售数量
    
    // 当前阶段
    BoxPhase public currentPhase;
    
    // 保底机制
    mapping(address => uint256) public guaranteeCount; // 用户连续未出史诗/传说的次数
    
    // NFT 属性映射
    mapping(uint256 => FishAttributes) public fishAttributes;
    
    // 授权合约地址
    address public stakingContract; // 质押合约地址
    
    // 鱼类名称映射
    string[9] public fishNames = [
        "Reef Minnow",           // Tier 1, Type 0
        "Anemone Clownfish",      // Tier 1, Type 1
        "Golden Amberjack",       // Tier 1, Type 2
        "Rainbow Swordfish",      // Tier 2, Type 3
        "Jade Tuna",              // Tier 2, Type 4
        "Electric Ray",           // Tier 2, Type 5
        "Abyssal Maw",            // Tier 3, Type 6
        "Crystal Whale Shark",    // Tier 3, Type 7
        "Sea Emperor Leviathan"   // Tier 3, Type 8
    ];
    
    // 事件
    event FishMinted(
        address indexed to,
        uint256 indexed tokenId,
        uint8 tier,
        uint8 starLevel,
        uint8 rarity,
        uint8 fishType
    );
    
    event BlindBoxOpened(
        address indexed buyer,
        uint256 indexed tokenId,
        uint8 tier,
        uint8 rarity
    );
    
    event DurabilityRepaired(
        uint256 indexed tokenId,
        uint8 oldDurability,
        uint8 newDurability
    );
    
    event FishEvolved(
        uint256 indexed tokenId,
        uint8 oldTier,
        uint8 newTier,
        uint8 newFishType
    );
    
    constructor() ERC721("Fish NFT", "FISH") Ownable(msg.sender) {
        // 设置阶段价格
        phasePrices[BoxPhase.Initial] = 0.05 ether;  // 0.05 ETH
        phasePrices[BoxPhase.Public] = 0.08 ether;  // 0.08 ETH
        phasePrices[BoxPhase.Regular] = 0.1 ether;  // 0.1 ETH
        
        // 设置阶段限量
        phaseLimits[BoxPhase.Initial] = 10_000;
        phaseLimits[BoxPhase.Public] = 20_000;
        phaseLimits[BoxPhase.Regular] = type(uint256).max; // 无限量
        
        currentPhase = BoxPhase.Initial;
    }
    
    /**
     * @dev 购买单个盲盒
     */
    function buyBlindBox() external payable nonReentrant {
        uint256 price = phasePrices[currentPhase];
        require(msg.value >= price, "Insufficient payment");
        require(phaseSold[currentPhase] < phaseLimits[currentPhase], "Phase sold out");
        
        // 检查保底机制
        bool guaranteed = guaranteeCount[msg.sender] >= 10;
        
        // 铸造随机鱼类
        uint256 tokenId = _mintRandomFish(msg.sender, guaranteed);
        
        // 更新保底计数
        FishAttributes memory attrs = fishAttributes[tokenId];
        if (attrs.rarity >= 2) { // 史诗或传说
            guaranteeCount[msg.sender] = 0;
        } else {
            guaranteeCount[msg.sender]++;
        }
        
        phaseSold[currentPhase]++;
        
        // 退款多余 ETH
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
        
        emit BlindBoxOpened(msg.sender, tokenId, attrs.tier, attrs.rarity);
    }
    
    /**
     * @dev 批量购买盲盒
     */
    function buyBlindBoxes(uint256 quantity) external payable nonReentrant {
        require(quantity > 0 && quantity <= 10, "Invalid quantity");
        uint256 price = phasePrices[currentPhase] * quantity;
        require(msg.value >= price, "Insufficient payment");
        require(phaseSold[currentPhase] + quantity <= phaseLimits[currentPhase], "Exceeds phase limit");
        
        for (uint256 i = 0; i < quantity; i++) {
            bool guaranteed = guaranteeCount[msg.sender] >= 10;
            uint256 tokenId = _mintRandomFish(msg.sender, guaranteed);
            
            FishAttributes memory attrs = fishAttributes[tokenId];
            if (attrs.rarity >= 2) {
                guaranteeCount[msg.sender] = 0;
            } else {
                guaranteeCount[msg.sender]++;
            }
            
            phaseSold[currentPhase]++;
            
            emit BlindBoxOpened(msg.sender, tokenId, attrs.tier, attrs.rarity);
        }
        
        // 退款多余 ETH
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
    }
    
    /**
     * @dev 铸造随机鱼类（内部函数）
     */
    function _mintRandomFish(address to, bool guaranteed) internal returns (uint256) {
        uint256 tokenId = totalSupply() + 1;
        _safeMint(to, tokenId);
        
        // 生成随机数
        uint256 random = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            tokenId,
            to
        )));
        
        uint8 rarity;
        uint8 tier;
        uint8 fishType;
        
        if (guaranteed) {
            // 保底：必出史诗或传说
            rarity = (random % 2 == 0) ? 2 : 3; // 史诗或传说
        } else {
            // 正常概率：45% 普通, 30% 稀有, 15% 史诗, 10% 传说
            uint256 rarityRand = random % 100;
            if (rarityRand < 45) {
                rarity = 0; // 普通
            } else if (rarityRand < 75) {
                rarity = 1; // 稀有
            } else if (rarityRand < 90) {
                rarity = 2; // 史诗
            } else {
                rarity = 3; // 传说
            }
        }
        
        // 根据稀有度确定 Tier
        if (rarity <= 1) {
            tier = 1; // 普通和稀有都是 Tier 1
            fishType = uint8(random % 3); // 0-2
        } else if (rarity == 2) {
            // 史诗：Tier 1 或 Tier 2
            tier = (random % 2 == 0) ? 1 : 2;
            if (tier == 1) {
                fishType = uint8(random % 3); // 0-2
            } else {
                fishType = uint8(3 + (random % 3)); // 3-5
            }
        } else {
            // 传说：Tier 2 或 Tier 3
            tier = (random % 2 == 0) ? 2 : 3;
            if (tier == 2) {
                fishType = uint8(3 + (random % 3)); // 3-5
            } else {
                fishType = uint8(6 + (random % 3)); // 6-8
            }
        }
        
        // 创建属性
        fishAttributes[tokenId] = FishAttributes({
            tier: tier,
            starLevel: 0,
            durability: 100,
            rarity: rarity,
            fishType: fishType,
            evolutionCount: 0,
            totalStakingTime: 0,
            combatPower: 0,
            geneSequence: random,
            createdAt: block.timestamp
        });
        
        emit FishMinted(to, tokenId, tier, 0, rarity, fishType);
        
        return tokenId;
    }
    
    /**
     * @dev 更新鱼类属性（仅授权合约或所有者可调用）
     */
    function updateFishAttributes(
        uint256 tokenId,
        uint8 starLevel,
        uint8 durability,
        uint256 totalStakingTime
    ) external {
        require(
            msg.sender == stakingContract || msg.sender == ownerOf(tokenId),
            "Not authorized"
        );
        
        FishAttributes storage attrs = fishAttributes[tokenId];
        attrs.starLevel = starLevel;
        attrs.durability = durability;
        attrs.totalStakingTime = totalStakingTime;
    }
    
    /**
     * @dev 进化鱼类（Tier 升级）
     */
    function evolveFish(uint256 tokenId, uint8 newTier, uint8 newFishType) external {
        require(
            msg.sender == stakingContract || msg.sender == ownerOf(tokenId),
            "Not authorized"
        );
        
        FishAttributes storage attrs = fishAttributes[tokenId];
        require(newTier > attrs.tier, "Tier must increase");
        require(newTier <= 3, "Invalid tier");
        
        uint8 oldTier = attrs.tier;
        attrs.tier = newTier;
        attrs.fishType = newFishType;
        attrs.starLevel = 1; // 重置为 1 星
        attrs.evolutionCount++;
        
        emit FishEvolved(tokenId, oldTier, newTier, newFishType);
    }
    
    /**
     * @dev 修复耐久度
     */
    function repairDurability(uint256 tokenId, uint8 newDurability) external {
        require(
            msg.sender == stakingContract || msg.sender == ownerOf(tokenId),
            "Not authorized"
        );
        require(newDurability <= 100, "Invalid durability");
        
        FishAttributes storage attrs = fishAttributes[tokenId];
        uint8 oldDurability = attrs.durability;
        attrs.durability = newDurability;
        
        emit DurabilityRepaired(tokenId, oldDurability, newDurability);
    }
    
    /**
     * @dev 获取鱼类完整属性
     */
    function getFishAttributes(uint256 tokenId) external view returns (FishAttributes memory) {
        // ownerOf 会检查 token 是否存在
        ownerOf(tokenId);
        return fishAttributes[tokenId];
    }
    
    /**
     * @dev 获取鱼类名称
     */
    function getFishName(uint256 tokenId) external view returns (string memory) {
        // ownerOf 会检查 token 是否存在
        ownerOf(tokenId);
        FishAttributes memory attrs = fishAttributes[tokenId];
        return fishNames[attrs.fishType];
    }
    
    /**
     * @dev 设置盲盒阶段
     */
    function setBoxPhase(BoxPhase phase) external onlyOwner {
        currentPhase = phase;
    }
    
    /**
     * @dev 设置阶段价格
     */
    function setPhasePrice(BoxPhase phase, uint256 price) external onlyOwner {
        phasePrices[phase] = price;
    }
    
    /**
     * @dev 设置质押合约地址
     */
    function setStakingContract(address _stakingContract) external onlyOwner {
        require(_stakingContract != address(0), "Invalid address");
        stakingContract = _stakingContract;
    }
    
    /**
     * @dev 提取 ETH（Owner）
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        
        // 80% → DAO 资金库，20% → 运营资金（简化处理，实际应发送到 DAO 合约）
        payable(owner()).transfer(balance);
    }
}

