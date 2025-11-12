// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SEAGovToken
 * @dev SEA GameFi 项目的治理代币，总供应量 1 亿 SEA-G
 */
contract SEAGovToken is ERC20, ERC20Burnable, Ownable {
    // 总供应量：1 亿 SEA-G
    uint256 public constant TOTAL_SUPPLY = 100_000_000 * 10**18; // 1 亿
    
    // 授权合约地址
    address public stakingPool; // 质押池地址（可铸造代币）
    address public governanceContract; // 治理合约地址（未来扩展）
    
    // 事件
    event GovernanceTokenMinted(address indexed to, uint256 amount);
    event StakingPoolSet(address indexed stakingPool);
    event GovernanceContractSet(address indexed governanceContract);
    
    constructor() ERC20("SEA Governance Token", "SEA-G") Ownable(msg.sender) {
        // 初始不铸造，全部通过 Tier 3 鱼类质押产出
    }
    
    /**
     * @dev 铸造治理代币（仅质押合约可调用）
     */
    function mint(address to, uint256 amount) external {
        require(msg.sender == stakingPool, "Only staking pool");
        require(totalSupply() + amount <= TOTAL_SUPPLY, "Exceeds total supply");
        
        _mint(to, amount);
        
        emit GovernanceTokenMinted(to, amount);
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
     * @dev 设置治理合约地址
     */
    function setGovernanceContract(address _governanceContract) external onlyOwner {
        require(_governanceContract != address(0), "Invalid address");
        governanceContract = _governanceContract;
        emit GovernanceContractSet(_governanceContract);
    }
}

