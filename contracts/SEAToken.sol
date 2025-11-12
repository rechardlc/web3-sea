// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SEAToken
 * @dev SEA GameFi 项目的主要功能代币，总供应量 100 亿 SEA
 */
contract SEAToken is ERC20, ERC20Burnable, Ownable, ReentrancyGuard {
    // 总供应量：100 亿 SEA
    uint256 public constant TOTAL_SUPPLY = 10_000_000_000 * 10**18; // 100 亿
    
    // 挖矿奖励：40 亿 SEA
    uint256 public constant MAX_MINING_REWARD = 4_000_000_000 * 10**18; // 40 亿
    
    // 流动性挖矿奖励：20 亿 SEA
    uint256 public constant MAX_LP_REWARD = 2_000_000_000 * 10**18; // 20 亿
    
    // 挖矿相关
    uint256 public miningRewardPerSecond; // 每秒挖矿奖励量
    uint256 public miningStartTime; // 挖矿开始时间
    uint256 public miningEndTime; // 挖矿结束时间（10年后）
    uint256 public totalMined; // 已挖矿总量
    
    // 流动性挖矿
    uint256 public totalLpReward; // 已发放 LP 奖励总量
    
    // 授权合约地址
    address public stakingPool; // 质押池地址
    address public liquidityPool; // 流动性池地址
    
    // 锁仓信息
    struct LockInfo {
        uint256 amount;      // 锁仓总量
        uint256 unlockTime;  // 解锁时间（1年后）
        uint256 releaseRate; // 每秒释放量
        uint256 released;    // 已释放量
    }
    
    mapping(address => LockInfo) public locks; // 用户锁仓信息
    
    // 事件
    event MiningRewardDistributed(address indexed to, uint256 amount);
    event LpRewardDistributed(address indexed to, uint256 amount);
    event TokensUnlocked(address indexed account, uint256 amount);
    event StakingPoolSet(address indexed stakingPool);
    event LiquidityPoolSet(address indexed liquidityPool);
    
    constructor() ERC20("SEA Token", "SEA") Ownable(msg.sender) {
        // 初始分配
        // 40% 挖矿奖励 - 不预铸造，通过挖矿释放
        // 20% 流动性池 - 立即释放
        uint256 liquidityAmount = 2_000_000_000 * 10**18; // 20 亿
        _mint(msg.sender, liquidityAmount);
        
        // 10% DAO 资金库 - 立即释放
        uint256 daoAmount = 1_000_000_000 * 10**18; // 10 亿
        _mint(msg.sender, daoAmount);
        
        // 10% 市场推广 - 立即释放
        uint256 marketingAmount = 1_000_000_000 * 10**18; // 10 亿
        _mint(msg.sender, marketingAmount);
        
        // 5% IDO 公开发售 - 25% 立即，75% 3个月线性
        uint256 idoImmediate = 125_000_000 * 10**18; // 1.25 亿（25%）
        _mint(msg.sender, idoImmediate);
        
        // 15% 团队和顾问 - 锁仓 4 年，1 年后开始线性释放
        uint256 teamAmount = 1_500_000_000 * 10**18; // 15 亿
        _mint(address(this), teamAmount);
        
        // 计算挖矿奖励每秒释放量（10年 = 315,360,000 秒）
        miningRewardPerSecond = MAX_MINING_REWARD / (10 * 365 days);
        miningStartTime = block.timestamp;
        miningEndTime = block.timestamp + (10 * 365 days);
    }
    
    /**
     * @dev 发放挖矿奖励（仅质押合约可调用）
     */
    function mintMiningReward(address to, uint256 amount) external {
        require(msg.sender == stakingPool, "Only staking pool");
        require(block.timestamp >= miningStartTime && block.timestamp <= miningEndTime, "Not in mining period");
        require(totalMined + amount <= MAX_MINING_REWARD, "Exceeds max mining reward");
        
        totalMined += amount;
        _mint(to, amount);
        
        emit MiningRewardDistributed(to, amount);
    }
    
    /**
     * @dev 发放流动性挖矿奖励
     */
    function mintLpReward(address to, uint256 amount) external {
        require(msg.sender == liquidityPool, "Only liquidity pool");
        require(totalLpReward + amount <= MAX_LP_REWARD, "Exceeds max LP reward");
        
        totalLpReward += amount;
        _mint(to, amount);
        
        emit LpRewardDistributed(to, amount);
    }
    
    /**
     * @dev 批量销毁代币
     */
    function burnBatch(uint256[] memory amounts) external {
        for (uint256 i = 0; i < amounts.length; i++) {
            if (amounts[i] > 0) {
                burn(amounts[i]);
            }
        }
    }
    
    /**
     * @dev 解锁锁仓代币
     */
    function unlockTokens() external nonReentrant {
        LockInfo storage lock = locks[msg.sender];
        require(lock.amount > 0, "No locked tokens");
        require(block.timestamp >= lock.unlockTime, "Not unlocked yet");
        
        uint256 elapsed = block.timestamp - lock.unlockTime;
        uint256 releasable = lock.releaseRate * elapsed;
        
        if (releasable > lock.amount - lock.released) {
            releasable = lock.amount - lock.released;
        }
        
        require(releasable > 0, "No tokens to unlock");
        
        lock.released += releasable;
        _transfer(address(this), msg.sender, releasable);
        
        emit TokensUnlocked(msg.sender, releasable);
    }
    
    /**
     * @dev 查询可解锁的代币数量
     */
    function getUnlockableAmount(address account) external view returns (uint256) {
        LockInfo storage lock = locks[account];
        if (lock.amount == 0 || block.timestamp < lock.unlockTime) {
            return 0;
        }
        
        uint256 elapsed = block.timestamp - lock.unlockTime;
        uint256 releasable = lock.releaseRate * elapsed;
        
        if (releasable > lock.amount - lock.released) {
            releasable = lock.amount - lock.released;
        }
        
        return releasable;
    }
    
    /**
     * @dev 设置团队锁仓（Owner 调用）
     */
    function setTeamLock(address account, uint256 amount) external onlyOwner {
        require(account != address(0), "Invalid address");
        require(amount > 0, "Amount must be greater than 0");
        require(locks[account].amount == 0, "Already locked");
        
        uint256 unlockTime = block.timestamp + 365 days; // 1年后开始解锁
        uint256 releaseRate = amount / (4 * 365 days); // 4年线性释放
        
        locks[account] = LockInfo({
            amount: amount,
            unlockTime: unlockTime,
            releaseRate: releaseRate,
            released: 0
        });
    }
    
    /**
     * @dev 设置质押池地址
     */
    function setStakingPool(address _stakingPool) external onlyOwner {
        require(_stakingPool != address(0), "Invalid address");
        stakingPool = _stakingPool;
        emit StakingPoolSet(_stakingPool);
    }
    
    /**
     * @dev 设置流动性池地址
     */
    function setLiquidityPool(address _liquidityPool) external onlyOwner {
        require(_liquidityPool != address(0), "Invalid address");
        liquidityPool = _liquidityPool;
        emit LiquidityPoolSet(_liquidityPool);
    }
}

