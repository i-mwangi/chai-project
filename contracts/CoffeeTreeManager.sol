// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "./system-contracts/hedera-token-service/HederaTokenService.sol";
import "./system-contracts/HederaResponseCodes.sol";
import "./system-contracts/hedera-token-service/IHederaTokenService.sol";
import "./system-contracts/hedera-token-service/KeyHelper.sol";
import "./system-contracts/hedera-token-service/IHRC719.sol";
import "./@openzeppelin/contracts/utils/Strings.sol";

contract CoffeeTreeManager is HederaTokenService, KeyHelper {
    
    // Tree metadata structure
    struct TreeMetadata {
        string location;
        string coffeeVariety;
        uint64 plantingDate;
        uint64 expectedYieldPerSeason;
        uint8 currentHealthScore;
        string farmingPractices;
        uint256 lastHealthUpdate;
    }

    // Health monitoring structure
    struct HealthUpdate {
        uint256 updateDate;
        uint8 healthScore;
        string notes;
        address updatedBy;
    }

    // State variables
    address public token;
    address public controller;
    address public admin;
    address public farmer;
    uint64 public totalSupply;
    string public groveName;
    
    TreeMetadata public treeMetadata;
    HealthUpdate[] public healthHistory;
    
    // Events
    event TreeHealthUpdated(
        uint8 indexed newHealthScore,
        string notes,
        address indexed updatedBy,
        uint256 timestamp
    );
    
    event TreeMetadataUpdated(
        string field,
        string newValue,
        address indexed updatedBy,
        uint256 timestamp
    );
    
    event FarmingPracticesUpdated(
        string newPractices,
        address indexed updatedBy,
        uint256 timestamp
    );

    receive() external payable {
        // do nothing
    }

    fallback() external payable {
        // do nothing
    }

    modifier onlyAdmin() {
        require(msg.sender == admin || msg.sender == address(this), "Only admin can call this function"); 
        _;
    }

    modifier onlyFarmer() {
        require(msg.sender == farmer, "Only farmer can call this function");
        _;
    }

    modifier onlyAuthorized() {
        require(
            msg.sender == admin || 
            msg.sender == farmer || 
            msg.sender == address(this), 
            "Not authorized"
        );
        _;
    }

    constructor(
        string memory _groveName,
        string memory _symbol,
        string memory _location,
        string memory _coffeeVariety,
        uint64 _expectedYieldPerSeason
    ) payable {
        admin = msg.sender;
        controller = address(this);
        groveName = _groveName;
        
        // Initialize tree metadata
        treeMetadata = TreeMetadata({
            location: _location,
            coffeeVariety: _coffeeVariety,
            plantingDate: uint64(block.timestamp),
            expectedYieldPerSeason: _expectedYieldPerSeason,
            currentHealthScore: 100, // Start with perfect health
            farmingPractices: "Organic farming practices",
            lastHealthUpdate: block.timestamp
        });

        // Create Hedera token
        IHederaTokenService.HederaToken memory tokenDetails;
        tokenDetails.name = string(abi.encodePacked("Coffee Tree Token - ", _groveName));
        tokenDetails.symbol = _symbol;
        tokenDetails.treasury = address(this);
        
        IHederaTokenService.Expiry memory expiry;
        expiry.autoRenewAccount = address(this);
        expiry.autoRenewPeriod = 7890000;
        tokenDetails.expiry = expiry;

        IHederaTokenService.TokenKey[] memory keys = new IHederaTokenService.TokenKey[](7);
        keys[0] = getSingleKey(KeyType.ADMIN, KeyValueType.CONTRACT_ID, address(this));
        keys[1] = getSingleKey(KeyType.KYC, KeyValueType.CONTRACT_ID, address(this));
        keys[2] = getSingleKey(KeyType.FREEZE, KeyValueType.CONTRACT_ID, address(this));
        keys[3] = getSingleKey(KeyType.WIPE, KeyValueType.CONTRACT_ID, address(this));
        keys[4] = getSingleKey(KeyType.SUPPLY, KeyValueType.CONTRACT_ID, address(this));
        keys[5] = getSingleKey(KeyType.FEE, KeyValueType.CONTRACT_ID, address(this));
        keys[6] = getSingleKey(KeyType.PAUSE, KeyValueType.CONTRACT_ID, address(this));

        tokenDetails.tokenKeys = keys;
        
        (int response, address tokenAddress) = HederaTokenService.createFungibleToken(tokenDetails, 0, 0);

        if (response != HederaResponseCodes.SUCCESS){
            revert("Failed to create token");
        }

        token = tokenAddress;
        totalSupply = 0;
    }

    /**
     * @dev Set the farmer address (called by issuer during grove registration)
     */
    function setFarmer(address _farmer) external onlyAdmin {
        farmer = _farmer;
    }

    /**
     * @dev Mint new tree tokens
     */
    function mint(uint64 amount) public onlyAdmin() {
        (int responseCode, int64 _newTotalSupply, ) = HederaTokenService.mintToken(token, int64(amount), new bytes[](0));

        if(responseCode != HederaResponseCodes.SUCCESS){
            revert("Failed to mint tree tokens");
        }

        totalSupply = uint64(_newTotalSupply);
    }

    /**
     * @dev Burn tree tokens
     */
    function burn(uint64 amount) public onlyAdmin() {
       (int responseCode, int64 _newTokenSupply) = HederaTokenService.burnToken(token, int64(amount), new int64[](0));

       if(responseCode != HederaResponseCodes.SUCCESS){
            revert("Failed to burn tree tokens");
       }

         totalSupply = uint64(_newTokenSupply);
    }

    /**
     * @dev Grant KYC to an account
     */
    function grantKYC(address account) public onlyAdmin() {
        (, bool isKYCed) = HederaTokenService.isKyc(token, account);

        if(!isKYCed){
            int responseCode = HederaTokenService.grantTokenKyc(token, account);

            if(responseCode != HederaResponseCodes.SUCCESS){
                revert("Failed to grant KYC");
            }
        }
    }

    /**
     * @dev Airdrop purchased tokens to investor
     */
    function airdropPurchasedTokens(address target, uint64 amount) public onlyAdmin() {
        bool isAssociated = IHRC719(token).isAssociated();

        if(!isAssociated){
            revert("Token is not associated");
        }

        IHederaTokenService.AccountAmount memory recipientAccount; 
        recipientAccount.accountID = target;
        recipientAccount.amount = int64(amount);

        IHederaTokenService.AccountAmount memory senderAccount;
        senderAccount.accountID = address(this);
        senderAccount.amount = -int64(amount);

        IHederaTokenService.TokenTransferList memory transferList;
        transferList.token = token;
        transferList.transfers = new IHederaTokenService.AccountAmount[](2);
        transferList.transfers[0] = senderAccount;
        transferList.transfers[1] = recipientAccount;

        IHederaTokenService.TokenTransferList[] memory airdropList = new IHederaTokenService.TokenTransferList[](1);
        airdropList[0] = transferList;

        int responseCode = HederaTokenService.airdropTokens(airdropList);

        if(responseCode != HederaResponseCodes.SUCCESS){
            revert("Failed to airdrop tokens");
        }
    }    /**

     * @dev Update tree health score and notes
     */
    function updateTreeHealth(
        uint8 _healthScore,
        string memory _notes
    ) external onlyAuthorized {
        require(_healthScore >= 0 && _healthScore <= 100, "Health score must be between 0-100");
        require(bytes(_notes).length > 0, "Notes cannot be empty");

        // Update metadata
        treeMetadata.currentHealthScore = _healthScore;
        treeMetadata.lastHealthUpdate = block.timestamp;

        // Add to health history
        HealthUpdate memory update = HealthUpdate({
            updateDate: block.timestamp,
            healthScore: _healthScore,
            notes: _notes,
            updatedBy: msg.sender
        });
        
        healthHistory.push(update);

        emit TreeHealthUpdated(_healthScore, _notes, msg.sender, block.timestamp);
    }

    /**
     * @dev Update farming practices
     */
    function updateFarmingPractices(string memory _newPractices) external onlyFarmer {
        require(bytes(_newPractices).length > 0, "Farming practices cannot be empty");
        
        treeMetadata.farmingPractices = _newPractices;

        emit FarmingPracticesUpdated(_newPractices, msg.sender, block.timestamp);
    }

    /**
     * @dev Update expected yield per season
     */
    function updateExpectedYield(uint64 _newExpectedYield) external onlyFarmer {
        require(_newExpectedYield > 0, "Expected yield must be positive");
        
        treeMetadata.expectedYieldPerSeason = _newExpectedYield;

        emit TreeMetadataUpdated(
            "expectedYieldPerSeason",
            Strings.toString(_newExpectedYield),
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Update coffee variety (in case of replanting)
     */
    function updateCoffeeVariety(string memory _newVariety) external onlyFarmer {
        require(bytes(_newVariety).length > 0, "Coffee variety cannot be empty");
        
        treeMetadata.coffeeVariety = _newVariety;

        emit TreeMetadataUpdated(
            "coffeeVariety",
            _newVariety,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Get complete tree metadata
     */
    function getTreeMetadata() external view returns (TreeMetadata memory) {
        return treeMetadata;
    }

    /**
     * @dev Get health history
     */
    function getHealthHistory() external view returns (HealthUpdate[] memory) {
        return healthHistory;
    }

    /**
     * @dev Get latest health update
     */
    function getLatestHealthUpdate() external view returns (HealthUpdate memory) {
        require(healthHistory.length > 0, "No health updates available");
        return healthHistory[healthHistory.length - 1];
    }

    /**
     * @dev Get current health score
     */
    function getCurrentHealthScore() external view returns (uint8) {
        return treeMetadata.currentHealthScore;
    }

    /**
     * @dev Get expected yield for current season
     */
    function getExpectedYield() external view returns (uint64) {
        return treeMetadata.expectedYieldPerSeason;
    }

    /**
     * @dev Get coffee variety
     */
    function getCoffeeVariety() external view returns (string memory) {
        return treeMetadata.coffeeVariety;
    }

    /**
     * @dev Get grove location
     */
    function getLocation() external view returns (string memory) {
        return treeMetadata.location;
    }

    /**
     * @dev Get farming practices
     */
    function getFarmingPractices() external view returns (string memory) {
        return treeMetadata.farmingPractices;
    }

    /**
     * @dev Calculate health-adjusted yield projection
     */
    function getHealthAdjustedYieldProjection() external view returns (uint64) {
        uint64 baseYield = treeMetadata.expectedYieldPerSeason;
        uint8 healthScore = treeMetadata.currentHealthScore;
        
        // Adjust yield based on health score (health score is 0-100)
        return (baseYield * healthScore) / 100;
    }

    /**
     * @dev Check if trees need attention based on health score
     */
    function needsAttention() external view returns (bool) {
        return treeMetadata.currentHealthScore < 70; // Below 70% health needs attention
    }

    /**
     * @dev Get days since last health update
     */
    function daysSinceLastHealthUpdate() external view returns (uint256) {
        if (treeMetadata.lastHealthUpdate == 0) {
            return 0;
        }
        return (block.timestamp - treeMetadata.lastHealthUpdate) / 86400; // 86400 seconds in a day
    }

    /**
     * @dev Airdrop revenue tokens to multiple holders (for revenue distribution)
     */
    function airdropRevenueTokens(
        address[] memory holders,
        uint64[] memory amounts
    ) external onlyAdmin {
        require(holders.length == amounts.length, "Arrays length mismatch");
        require(holders.length > 0, "No holders provided");

        for (uint256 i = 0; i < holders.length; i++) {
            if (amounts[i] > 0) {
                airdropPurchasedTokens(holders[i], amounts[i]);
            }
        }
    }

    /**
     * @dev Get token statistics
     */
    function getTokenStats() external view returns (
        uint64 _totalSupply,
        uint256 _circulatingSupply,
        address _tokenAddress
    ) {
        _totalSupply = totalSupply;
        _circulatingSupply = totalSupply; // For now, all tokens are circulating
        _tokenAddress = token;
    }
}