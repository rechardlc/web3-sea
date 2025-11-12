// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./FishNFT.sol";
import "./SEAToken.sol";
import "./SEAGovToken.sol";

/**
 * @title StakingPool
 * @dev SEA GameFi 项目的质押池合约，管理三个质押池
 */
contract StakingPool is Ownable, ReentrancyGuard {
    // 池子类型
    enum PoolType {
        TidePool,  // 新手池
        ReefPool,  // 成长池
        DeepSea    // 进化池
    }
    
    // 质押信息
    struct StakingInfo {
        address owner;          // 所有者
        uint256 tokenId;        // NFT ID
        PoolType poolType;      // 池子类型
        uint256 stakedAt;       // 质押时间
        uint256 lastClaimTime;  // 上次领取时间
        uint256 accumulatedReward; // 累计奖励
    }
    
    // 升星信息
    struct StarUpgradeInfo {
        bool upgrading;         // 是否正在升星
        uint8 targetStar;       // 目标星级
        uint256 startTime;      // 开始时间
        uint256 requiredTime;   // 所需时间（秒）
        uint256 acceleratedTime; // 已加速时间
    }
    
    // 合约地址
    FishNFT public fishNFT;
    SEAToken public seaToken;
    SEAGovToken public seaGovToken;
    
    // 质押映射
    mapping(uint256 => StakingInfo) public stakingInfo; // tokenId => StakingInfo
    mapping(address => uint256[]) public userStakedTokens; // user => tokenId[]
    
    // 升星映射
    mapping(uint256 => StarUpgradeInfo) public starUpgradeInfo; // tokenId => StarUpgradeInfo
    
    // 升星时间表（秒）
    uint256[9] public starUpgradeTimes = [
        24 hours,   // 0→1
        36 hours,   // 1→2
        48 hours,   // 2→3
        72 hours,   // 3→4
        96 hours,   // 4→5
        120 hours,  // 5→6
        144 hours,  // 6→7
        168 hours,  // 7→8
        192 hours   // 8→9
    ];
    
    // 升星加速消耗（SEA）
    uint256[9] public starUpgradeCosts = [
        500 * 10**18,    // 0→1
        800 * 10**18,    // 1→2
        1200 * 10**18,   // 2→3
        2000 * 10**18,   // 3→4
        3000 * 10**18,   // 4→5
        4500 * 10**18,   // 5→6
        6500 * 10**18,   // 6→7
        9000 * 10**18,   // 7→8
        12000 * 10**18   // 8→9
    ];
    
    // 进化成本
    uint256 public constant EVOLVE_COST_TIER1_TO_2 = 50_000 * 10**18; // 50,000 SEA
    uint256 public constant EVOLVE_COST_TIER2_TO_3 = 200_000 * 10**18; // 200,000 SEA
    uint256 public constant EVOLVE_COST_GOV_TIER2_TO_3 = 100 * 10**18; // 100 SEA-G
    
    // 基础失败率
    uint8[9] public baseFailureRates = [5, 5, 5, 6, 6, 7, 7, 8, 10]; // 0-9星的基础失败率（%）
    
    // 事件
    event FishStaked(address indexed user, uint256 indexed tokenId, PoolType poolType);
    event FishUnstaked(address indexed user, uint256 indexed tokenId);
    event StarUpgradeStarted(uint256 indexed tokenId, uint8 targetStar);
    event StarUpgraded(uint256 indexed tokenId, uint8 oldStar, uint8 newStar);
    event StarUpgradeFailed(uint256 indexed tokenId, uint8 star);
    event StarUpgradeAccelerated(uint256 indexed tokenId, uint256 seaAmount, uint256 timeReduced);
    event FishEvolved(uint256 indexed tokenId, uint8 oldTier, uint8 newTier);
    event EvolutionFailed(uint256 indexed tokenId);
    event RewardsClaimed(address indexed user, uint256 indexed tokenId, uint256 seaAmount, uint256 govAmount);
    event DurabilityRepaired(uint256 indexed tokenId, uint8 oldDurability, uint8 newDurability);
    
    constructor(
        address _fishNFT,
        address _seaToken,
        address _seaGovToken
    ) Ownable(msg.sender) {
        fishNFT = FishNFT(_fishNFT);
        seaToken = SEAToken(_seaToken);
        seaGovToken = SEAGovToken(_seaGovToken);
    }
    
    /**
     * @dev 初始化合约（设置授权）
     */
    function initialize() external onlyOwner {
        // 这个函数可以在部署后调用，设置必要的授权
        // 实际授权需要在各个合约中单独设置
    }
    
    /**
     * @dev 质押鱼类
     */
    function stakeFish(uint256 tokenId, PoolType poolType) external nonReentrant {
        require(fishNFT.ownerOf(tokenId) == msg.sender, "Not owner");
        require(stakingInfo[tokenId].owner == address(0), "Already staked");
        
        FishNFT.FishAttributes memory attrs = fishNFT.getFishAttributes(tokenId);
        require(attrs.durability >= 20, "Durability too low");
        
        // 检查池子准入条件
        _checkPoolAccess(attrs, poolType);
        
        // 检查质押上限
        uint256 userStakeCount = userStakedTokens[msg.sender].length;
        if (poolType == PoolType.TidePool) {
            require(userStakeCount < 10, "TidePool limit reached");
        } else if (poolType == PoolType.ReefPool) {
            require(userStakeCount < 20, "ReefPool limit reached");
        } else {
            require(userStakeCount < 5, "DeepSea limit reached");
        }
        
        // 转移 NFT
        fishNFT.transferFrom(msg.sender, address(this), tokenId);
        
        // 创建质押信息
        stakingInfo[tokenId] = StakingInfo({
            owner: msg.sender,
            tokenId: tokenId,
            poolType: poolType,
            stakedAt: block.timestamp,
            lastClaimTime: block.timestamp,
            accumulatedReward: 0
        });
        
        userStakedTokens[msg.sender].push(tokenId);
        
        emit FishStaked(msg.sender, tokenId, poolType);
    }
    
    /**
     * @dev 取消质押
     */
    function unstakeFish(uint256 tokenId) external nonReentrant {
        StakingInfo storage info = stakingInfo[tokenId];
        require(info.owner == msg.sender, "Not owner");
        require(!starUpgradeInfo[tokenId].upgrading, "Upgrading in progress");
        
        // 领取奖励
        _claimRewards(tokenId);
        
        // 删除质押信息
        _removeUserStakedToken(msg.sender, tokenId);
        delete stakingInfo[tokenId];
        
        // 返回 NFT
        fishNFT.transferFrom(address(this), msg.sender, tokenId);
        
        emit FishUnstaked(msg.sender, tokenId);
    }
    
    /**
     * @dev 开始升星
     */
    function startStarUpgrade(uint256 tokenId) external nonReentrant {
        StakingInfo storage info = stakingInfo[tokenId];
        require(info.owner == msg.sender, "Not owner");
        require(!starUpgradeInfo[tokenId].upgrading, "Already upgrading");
        
        FishNFT.FishAttributes memory attrs = fishNFT.getFishAttributes(tokenId);
        require(attrs.starLevel < 9, "Already max star");
        require(attrs.durability >= 50, "Durability too low");
        
        uint8 targetStar = attrs.starLevel + 1;
        uint256 requiredTime = starUpgradeTimes[attrs.starLevel];
        
        starUpgradeInfo[tokenId] = StarUpgradeInfo({
            upgrading: true,
            targetStar: targetStar,
            startTime: block.timestamp,
            requiredTime: requiredTime,
            acceleratedTime: 0
        });
        
        // 消耗耐久度
        uint8 newDurability = attrs.durability >= 10 ? attrs.durability - 10 : 0;
        fishNFT.updateFishAttributes(tokenId, attrs.starLevel, newDurability, attrs.totalStakingTime);
        
        emit StarUpgradeStarted(tokenId, targetStar);
    }
    
    /**
     * @dev 完成升星
     */
    function completeStarUpgrade(uint256 tokenId) external nonReentrant {
        StarUpgradeInfo storage upgrade = starUpgradeInfo[tokenId];
        require(upgrade.upgrading, "Not upgrading");
        
        StakingInfo storage info = stakingInfo[tokenId];
        require(info.owner == msg.sender, "Not owner");
        
        FishNFT.FishAttributes memory attrs = fishNFT.getFishAttributes(tokenId);
        
        uint256 elapsed = block.timestamp - upgrade.startTime;
        uint256 requiredTime = upgrade.requiredTime - upgrade.acceleratedTime;
        
        require(elapsed >= requiredTime, "Time not reached");
        
        // 计算失败率
        uint8 failureRate = baseFailureRates[attrs.starLevel];
        uint256 random = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, tokenId))) % 100;
        
        if (random < failureRate) {
            // 升星失败
            uint8 newStar = attrs.starLevel > 0 ? attrs.starLevel - 1 : 0;
            uint8 newDurability = attrs.durability >= 20 ? attrs.durability - 20 : 0;
            
            fishNFT.updateFishAttributes(tokenId, newStar, newDurability, attrs.totalStakingTime);
            delete starUpgradeInfo[tokenId];
            
            emit StarUpgradeFailed(tokenId, newStar);
        } else {
            // 升星成功
            fishNFT.updateFishAttributes(tokenId, upgrade.targetStar, attrs.durability, attrs.totalStakingTime);
            delete starUpgradeInfo[tokenId];
            
            emit StarUpgraded(tokenId, attrs.starLevel, upgrade.targetStar);
        }
    }
    
    /**
     * @dev 加速升星
     */
    function accelerateStarUpgrade(uint256 tokenId, uint256 seaAmount) external nonReentrant {
        StarUpgradeInfo storage upgrade = starUpgradeInfo[tokenId];
        require(upgrade.upgrading, "Not upgrading");
        
        StakingInfo storage info = stakingInfo[tokenId];
        require(info.owner == msg.sender, "Not owner");
        
        require(seaToken.balanceOf(msg.sender) >= seaAmount, "Insufficient SEA");
        require(seaAmount > 0, "Amount must be greater than 0");
        
        // 计算可加速的最大时间（最多50%）
        uint256 maxAccelerateTime = upgrade.requiredTime / 2;
        uint256 remainingTime = upgrade.requiredTime - upgrade.acceleratedTime;
        uint256 maxAccelerateRemaining = maxAccelerateTime > upgrade.acceleratedTime 
            ? maxAccelerateTime - upgrade.acceleratedTime 
            : 0;
        
        if (maxAccelerateRemaining == 0) {
            revert("Max acceleration reached");
        }
        
        // 计算加速时间（递减回报）
        uint256 timeReduced = 0;
        uint256 remaining = remainingTime;
        
        // 前25%时间：1 SEA = 1分钟
        uint256 firstQuarter = remaining / 4;
        if (firstQuarter > 0 && seaAmount > 0) {
            uint256 firstQuarterCost = firstQuarter * 60; // 转换为秒
            if (seaAmount >= firstQuarterCost) {
                timeReduced += firstQuarter;
                seaAmount -= firstQuarterCost;
            } else {
                timeReduced += seaAmount / 60;
                seaAmount = 0;
            }
        }
        
        // 25%-50%时间：1 SEA = 0.5分钟
        if (seaAmount > 0 && timeReduced < maxAccelerateRemaining) {
            uint256 secondQuarter = remaining / 4;
            uint256 available = maxAccelerateRemaining - timeReduced;
            uint256 secondQuarterAvailable = secondQuarter < available ? secondQuarter : available;
            
            if (secondQuarterAvailable > 0) {
                uint256 secondQuarterCost = secondQuarterAvailable * 120; // 转换为秒
                if (seaAmount >= secondQuarterCost) {
                    timeReduced += secondQuarterAvailable;
                    seaAmount -= secondQuarterCost;
                } else {
                    timeReduced += seaAmount / 120;
                    seaAmount = 0;
                }
            }
        }
        
        require(timeReduced > 0, "No time reduced");
        require(timeReduced <= maxAccelerateRemaining, "Exceeds max acceleration");
        
        // 销毁 SEA
        seaToken.transferFrom(msg.sender, address(this), seaAmount);
        seaToken.burn(seaAmount);
        
        upgrade.acceleratedTime += timeReduced;
        
        emit StarUpgradeAccelerated(tokenId, seaAmount, timeReduced);
    }
    
    /**
     * @dev 进化鱼类
     */
    function evolveFish(uint256 tokenId, uint256 additionalSea) external nonReentrant {
        StakingInfo storage info = stakingInfo[tokenId];
        require(info.owner == msg.sender, "Not owner");
        
        FishNFT.FishAttributes memory attrs = fishNFT.getFishAttributes(tokenId);
        require(attrs.starLevel == 9, "Must be 9 stars");
        require(attrs.durability >= 50, "Durability too low");
        require(attrs.tier < 3, "Already max tier");
        
        uint256 seaCost;
        uint256 govCost = 0;
        uint8 baseSuccessRate;
        
        if (attrs.tier == 1) {
            // Tier 1 → Tier 2
            seaCost = EVOLVE_COST_TIER1_TO_2;
            baseSuccessRate = 70;
        } else {
            // Tier 2 → Tier 3
            seaCost = EVOLVE_COST_TIER2_TO_3;
            govCost = EVOLVE_COST_GOV_TIER2_TO_3;
            baseSuccessRate = 50;
        }
        
        // 检查余额
        require(seaToken.balanceOf(msg.sender) >= seaCost + additionalSea, "Insufficient SEA");
        if (govCost > 0) {
            require(seaGovToken.balanceOf(msg.sender) >= govCost, "Insufficient SEA-G");
        }
        
        // 销毁代币
        seaToken.transferFrom(msg.sender, address(this), seaCost + additionalSea);
        seaToken.burn(seaCost + additionalSea);
        
        if (govCost > 0) {
            seaGovToken.transferFrom(msg.sender, address(this), govCost);
            seaGovToken.burn(govCost);
        }
        
        // 计算成功率（额外 SEA 提高成功率，每 10,000 SEA 提高 2%，最多 20%）
        uint8 successRate = baseSuccessRate;
        uint256 bonusRate = (additionalSea / (10_000 * 10**18)) * 2;
        if (bonusRate > 20) bonusRate = 20;
        successRate += uint8(bonusRate);
        
        // 成功率判定
        uint256 random = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, tokenId))) % 100;
        
        if (random < successRate) {
            // 进化成功
            uint8 newTier = attrs.tier + 1;
            uint8 newFishType;
            
            if (newTier == 2) {
                newFishType = uint8(3 + (random % 3)); // 3-5
            } else {
                newFishType = uint8(6 + (random % 3)); // 6-8
            }
            
            fishNFT.evolveFish(tokenId, newTier, newFishType);
            fishNFT.updateFishAttributes(tokenId, 1, attrs.durability, attrs.totalStakingTime);
            
            emit FishEvolved(tokenId, attrs.tier, newTier);
        } else {
            // 进化失败
            fishNFT.updateFishAttributes(tokenId, 5, 20, attrs.totalStakingTime);
            
            emit EvolutionFailed(tokenId);
        }
    }
    
    /**
     * @dev 领取单个 NFT 的奖励
     */
    function claimRewards(uint256 tokenId) external nonReentrant {
        StakingInfo storage info = stakingInfo[tokenId];
        require(info.owner == msg.sender, "Not owner");
        
        _claimRewards(tokenId);
    }
    
    /**
     * @dev 批量领取所有奖励
     */
    function claimAllRewards() external nonReentrant {
        uint256[] memory tokenIds = userStakedTokens[msg.sender];
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (stakingInfo[tokenIds[i]].owner == msg.sender) {
                _claimRewards(tokenIds[i]);
            }
        }
    }
    
    /**
     * @dev 修复耐久度
     */
    function repairDurability(uint256 tokenId, uint256 repairPoints) external nonReentrant {
        require(repairPoints > 0 && repairPoints <= 100, "Invalid repair points");
        
        StakingInfo storage info = stakingInfo[tokenId];
        require(info.owner == msg.sender, "Not owner");
        
        FishNFT.FishAttributes memory attrs = fishNFT.getFishAttributes(tokenId);
        require(attrs.durability < 100, "Already full durability");
        
        // 计算成本（批量折扣）
        uint256 cost;
        if (repairPoints == 1) {
            cost = 10 * 10**18; // 10 SEA
        } else if (repairPoints <= 10) {
            cost = repairPoints * 9 * 10**18; // 9折
        } else if (repairPoints <= 50) {
            cost = repairPoints * 8 * 10**18; // 8折
        } else {
            cost = repairPoints * 7 * 10**18; // 7折
        }
        
        require(seaToken.balanceOf(msg.sender) >= cost, "Insufficient SEA");
        
        // 销毁 SEA
        seaToken.transferFrom(msg.sender, address(this), cost);
        seaToken.burn(cost);
        
        // 修复耐久度
        uint8 newDurability = attrs.durability + uint8(repairPoints);
        if (newDurability > 100) newDurability = 100;
        
        uint8 oldDurability = attrs.durability;
        fishNFT.repairDurability(tokenId, newDurability);
        
        emit DurabilityRepaired(tokenId, oldDurability, newDurability);
    }
    
    /**
     * @dev 内部函数：领取奖励
     */
    function _claimRewards(uint256 tokenId) internal {
        StakingInfo storage info = stakingInfo[tokenId];
        FishNFT.FishAttributes memory attrs = fishNFT.getFishAttributes(tokenId);
        
        // 计算 SEA 奖励
        uint256 seaReward = _calculateReward(tokenId, attrs, info);
        
        // 计算 SEA-G 奖励（仅 Tier 3）
        uint256 govReward = 0;
        if (attrs.tier == 3) {
            govReward = _calculateGovReward(tokenId, attrs, info);
        }
        
        if (seaReward > 0 || govReward > 0) {
            info.lastClaimTime = block.timestamp;
            info.accumulatedReward += seaReward;
            
            // 发放奖励
            if (seaReward > 0) {
                seaToken.mintMiningReward(info.owner, seaReward);
            }
            if (govReward > 0) {
                seaGovToken.mint(info.owner, govReward);
            }
            
            emit RewardsClaimed(info.owner, tokenId, seaReward, govReward);
        }
    }
    
    /**
     * @dev 计算 SEA 奖励
     */
    function _calculateReward(
        uint256 /* tokenId */,
        FishNFT.FishAttributes memory attrs,
        StakingInfo memory info
    ) internal view returns (uint256) {
        // 基础产出 × 星级倍率 × 稀有度加成 × 耐久度系数 × 池子倍率
        
        // 基础产出（每小时）
        uint256 baseOutput = _getBaseOutput(attrs.starLevel);
        
        // 星级倍率
        uint256 starMultiplier = 100 + (attrs.starLevel * 10); // 100% + 每星10%
        
        // 稀有度加成
        uint256 rarityMultiplier = _getRarityMultiplier(attrs.rarity);
        
        // 耐久度系数
        uint256 durabilityMultiplier = _getDurabilityMultiplier(attrs.durability);
        
        // 池子倍率
        uint256 poolMultiplier = _getPoolMultiplier(info.poolType, attrs);
        
        // 计算时间（秒）
        uint256 timeElapsed = block.timestamp - info.lastClaimTime;
        
        // 每小时产出
        uint256 hourlyOutput = (baseOutput * starMultiplier * rarityMultiplier * durabilityMultiplier * poolMultiplier) / (100 * 100 * 100 * 100);
        
        // 计算总奖励
        uint256 reward = (hourlyOutput * timeElapsed) / 3600;
        
        // 检查每日上限
        uint256 dailyLimit = _getDailyLimit(info.poolType);
        uint256 maxReward = (dailyLimit * timeElapsed) / 86400;
        
        return reward > maxReward ? maxReward : reward;
    }
    
    /**
     * @dev 计算 SEA-G 奖励（仅 Tier 3）
     */
    function _calculateGovReward(
        uint256 /* tokenId */,
        FishNFT.FishAttributes memory attrs,
        StakingInfo memory info
    ) internal view returns (uint256) {
        if (attrs.tier != 3) return 0;
        
        // 每日产出：5 + fishType * 3 SEA-G
        // fishType 6-8，对应产出 5, 8, 11 SEA-G/天
        uint256 dailyOutput = (5 + (attrs.fishType - 6) * 3) * 10**18;
        
        uint256 timeElapsed = block.timestamp - info.lastClaimTime;
        return (dailyOutput * timeElapsed) / 86400;
    }
    
    /**
     * @dev 获取基础产出（每小时）
     */
    function _getBaseOutput(uint8 starLevel) internal pure returns (uint256) {
        if (starLevel == 0) return 10 * 10**18;
        if (starLevel == 1) return 15 * 10**18;
        if (starLevel == 2) return 20 * 10**18;
        if (starLevel == 3) return 30 * 10**18;
        if (starLevel == 4) return 45 * 10**18;
        if (starLevel == 5) return 60 * 10**18;
        if (starLevel == 6) return 80 * 10**18;
        if (starLevel == 7) return 100 * 10**18;
        if (starLevel == 8) return 120 * 10**18;
        return 120 * 10**18; // 9星
    }
    
    /**
     * @dev 获取稀有度倍率
     */
    function _getRarityMultiplier(uint8 rarity) internal pure returns (uint256) {
        if (rarity == 0) return 100; // 普通：1.0x
        if (rarity == 1) return 110; // 稀有：1.1x
        if (rarity == 2) return 125; // 史诗：1.25x
        return 150; // 传说：1.5x
    }
    
    /**
     * @dev 获取耐久度系数
     */
    function _getDurabilityMultiplier(uint8 durability) internal pure returns (uint256) {
        if (durability >= 80) return 100; // 100% 产出效率
        if (durability >= 50) return 80;  // 80% 产出效率
        if (durability >= 20) return 50; // 50% 产出效率
        return 0; // 无法质押
    }
    
    /**
     * @dev 获取池子倍率
     */
    function _getPoolMultiplier(PoolType poolType, FishNFT.FishAttributes memory attrs) internal pure returns (uint256) {
        if (poolType == PoolType.TidePool) {
            return 100; // 1.0x
        } else if (poolType == PoolType.ReefPool) {
            // 1.5x - 2.0x（根据星级）
            return 150 + (uint256(attrs.starLevel) * 5); // 150% + 每星5%
        } else {
            // 2.5x - 4.0x（根据 Tier 和星级）
            uint256 base = 250; // 2.5x
            base += uint256(attrs.tier) * 50; // Tier 加成
            base += uint256(attrs.starLevel) * 10; // 星级加成
            return base > 400 ? 400 : base; // 最多 4.0x
        }
    }
    
    /**
     * @dev 获取每日上限
     */
    function _getDailyLimit(PoolType poolType) internal pure returns (uint256) {
        if (poolType == PoolType.TidePool) {
            return 500 * 10**18; // 500 SEA/天
        } else if (poolType == PoolType.ReefPool) {
            return 2000 * 10**18; // 2,000 SEA/天
        } else {
            return 5000 * 10**18; // 5,000 SEA/天
        }
    }
    
    /**
     * @dev 检查池子准入条件
     */
    function _checkPoolAccess(FishNFT.FishAttributes memory attrs, PoolType poolType) internal pure {
        if (poolType == PoolType.TidePool) {
            require(attrs.tier == 1, "TidePool: Tier 1 only");
            require(attrs.starLevel <= 3, "TidePool: 0-3 stars only");
        } else if (poolType == PoolType.ReefPool) {
            require(attrs.tier <= 2, "ReefPool: Tier 1-2 only");
            require(attrs.starLevel >= 4 && attrs.starLevel <= 8, "ReefPool: 4-8 stars only");
        } else {
            // DeepSea: 9星 Tier 1/2 或任意 Tier 2/3
            require(
                (attrs.starLevel == 9 && attrs.tier <= 2) || attrs.tier >= 2,
                "DeepSea: 9 star Tier 1/2 or Tier 2/3"
            );
        }
    }
    
    /**
     * @dev 移除用户质押的 tokenId
     */
    function _removeUserStakedToken(address user, uint256 tokenId) internal {
        uint256[] storage tokens = userStakedTokens[user];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenId) {
                tokens[i] = tokens[tokens.length - 1];
                tokens.pop();
                break;
            }
        }
    }
    
    /**
     * @dev 获取质押信息
     */
    function getStakingInfo(uint256 tokenId) external view returns (StakingInfo memory) {
        return stakingInfo[tokenId];
    }
    
    /**
     * @dev 获取用户质押列表
     */
    function getUserStakedTokens(address user) external view returns (uint256[] memory) {
        return userStakedTokens[user];
    }
    
    /**
     * @dev 获取待领取奖励
     */
    function getPendingRewards(uint256 tokenId) external view returns (uint256 seaReward, uint256 govReward) {
        StakingInfo memory info = stakingInfo[tokenId];
        require(info.owner != address(0), "Not staked");
        
        FishNFT.FishAttributes memory attrs = fishNFT.getFishAttributes(tokenId);
        seaReward = _calculateReward(tokenId, attrs, info);
        
        if (attrs.tier == 3) {
            govReward = _calculateGovReward(tokenId, attrs, info);
        }
    }
}

