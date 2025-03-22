// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "./system-contracts/hedera-token-service/HederaTokenService.sol";
import "./system-contracts/HederaResponseCodes.sol";
import "./system-contracts/hedera-token-service/IHederaTokenService.sol";
import "./system-contracts/hedera-token-service/KeyHelper.sol";
import "./PriceOracle.sol";
import "./reserve.sol";
import "./TokenizedAssetManager.sol";

interface IERC20 {

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

}


// TODO: add controls to prevent over liquidation from reserve in case of more than 10% of reserve has been loaned out
contract Issuer {

    event AssetPurchased(string name, uint64 amount, address buyer);
    event AssetSold(string name, uint64 amount, address seller);
    
    address public admin;
    PriceOracle constant oracle = PriceOracle(address(0x40c));
    IHederaTokenService constant hts = IHederaTokenService(address(0x167));
    address constant USDC_TOKEN_ADDRESS = address(0x40a);
    mapping(string => TokenizedAssetManager) public tokenizedAssets;
    mapping(address => AssetCollateralReserve) public reserves;

    

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    receive() external payable {
        // do nothing
    }

    fallback() external payable {
        // do nothing
    }

    constructor() {
        admin = msg.sender;
    }
    
    function createTokenizedAsset(string memory _name, string memory _symbol) payable public onlyAdmin {
        TokenizedAssetManager asset = new TokenizedAssetManager{value: msg.value}(_name, _symbol);
        AssetCollateralReserve reserve = new AssetCollateralReserve(address(asset));
        tokenizedAssets[_name] = asset;
        reserves[asset.token()] = reserve;
    }

    function mint(string memory name, uint64 amount) public onlyAdmin() {
        tokenizedAssets[name].mint(amount);
    }

    function burn(string memory name, uint64 amount) public onlyAdmin() {
        tokenizedAssets[name].burn(amount);
    }

    function grantKYC(string memory name, address account) public {
        tokenizedAssets[name].grantKYC(account);
    }

    function getTokenAddress(string memory name) public view returns (address) {
        return tokenizedAssets[name].token();
    }

    function purchaseAsset(string memory name, uint64 amount) public {
        TokenizedAssetManager asset = tokenizedAssets[name];
        address token = asset.token();
        AssetCollateralReserve assetCollateralReserve = reserves[token];

        uint64 usdcPricePerAsset = oracle.getPrice(token);

        // calculate usdc price
        uint64 totalCost = (usdcPricePerAsset * amount);

        // Transfer USDC to reserve
        int responseCode = hts.transferFrom(USDC_TOKEN_ADDRESS, msg.sender, address(assetCollateralReserve), uint64(totalCost));

        if(responseCode != HederaResponseCodes.SUCCESS){
            revert("Failed to transfer USDC");
        }
        
        // airdrop asset to buyer
        asset.airdropPurchasedTokens(msg.sender, amount);
        assetCollateralReserve.deposit(totalCost);

        emit AssetPurchased(name, amount, msg.sender);
    }


    function sellAsset(string memory name, uint64 suppliedAssets) public {
        // TODO: add restrictions on howmuch can be withdrawn from reserve
        TokenizedAssetManager a = tokenizedAssets[name];
        address token = a.token();
        AssetCollateralReserve r = reserves[token];

        uint64 usdcPricePerAsset = oracle.getPrice(token);

        uint64 refundAmount = (suppliedAssets * usdcPricePerAsset) / oracle.denominator();

        // transfer asset from user to contract
        int responseCode = hts.transferFrom(token, msg.sender, address(a), uint64(suppliedAssets));

        if(responseCode != HederaResponseCodes.SUCCESS){
            revert("Failed to transfer");
        }

        r.refund(uint64(refundAmount), msg.sender);

        emit AssetSold(name, suppliedAssets, msg.sender); // TODO: due to size issues may need to remove this
    }
}