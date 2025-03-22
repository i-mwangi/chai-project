// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "./system-contracts/hedera-token-service/HederaTokenService.sol";
import "./system-contracts/HederaResponseCodes.sol";
import "./system-contracts/hedera-token-service/IHederaTokenService.sol";
import "./system-contracts/hedera-token-service/KeyHelper.sol";
import "./system-contracts/hedera-token-service/IHRC719.sol";
import "./Issuer.sol";
import "./TokenizedAssetManager.sol";
import "./@openzeppelin/contracts/utils/math/Math.sol";

contract Lender {

    address public admin; 
    Issuer constant issuer = Issuer(payable(address(0x410)));
    PriceOracle constant oracle = PriceOracle(address(0x40c));
    Reserve constant reserve = Reserve(address(0x40e));
    IHederaTokenService constant hts = IHederaTokenService(address(0x167));
    address constant USDC_TOKEN_ADDRESS = address(0x40a);

    receive() external payable {
        // do nothing
    }

    fallback() external payable {
        // do nothing
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function"); 
        _;
    }

    constructor(){
        admin = msg.sender;
    }


    function takeOutLoan(string memory collateral, uint64 amount) public {
        TokenizedAssetManager asset = issuer.tokenizedAssets(collateral);
        require(asset != TokenizedAssetManager(payable(address(0))), "Asset does not exist");

        address token = asset.token();
        AssetCollateralReserve assetCollateralReserve = reserve.reserves(token);

        TokenizedAssetManager.Loan memory existingLoan = asset.getLoan(msg.sender);

        require(existingLoan.isOutstanding == false, "Loan already exists");
        require(existingLoan.isLiquidated == false, "Loan already exists");

        uint64 usdcPricePerAsset = oracle.getPrice(token);

        uint64 baseLockedAssets = uint64(Math.ceilDiv(uint256(amount * oracle.denominator()) , uint256(usdcPricePerAsset)));
        
        uint64 collateralisedLockedAssets = uint64(Math.ceilDiv((baseLockedAssets * 125) , 100)); // 125% collateralisation ratio

        uint64 liquidationPriceUSDC = uint64(Math.ceilDiv((usdcPricePerAsset * 90) ,100));

        uint64 repayAmount = uint64(Math.ceilDiv((amount * 110) , 100)); // 110% repayment amount

        // transfer asset from user to contract
        int responseCode = hts.transferFrom(token, msg.sender, address(asset), uint256(collateralisedLockedAssets));

        if(responseCode != HederaResponseCodes.SUCCESS){
            revert("Failed to transfer asset");
        }

        assetCollateralReserve.refund(uint256(amount), msg.sender);

        asset.recordLoan(msg.sender, amount, collateralisedLockedAssets, liquidationPriceUSDC, repayAmount);
    }


    function repayOutstandingLoan(string memory collateralizedAsset) public {
        // Before contract call, approve USDC transfer from user to contract
        TokenizedAssetManager asset = issuer.tokenizedAssets(collateralizedAsset);
        TokenizedAssetManager.Loan memory loan = asset.getLoan(msg.sender);
        address token = asset.token();
        AssetCollateralReserve assetCollateralReserve = reserve.reserves(token);

        if(!loan.isOutstanding ){
            revert("No outstanding loan for borrower");
        }

        if(loan.isLiquidated){
            revert("Loan is liquidated"); // TODO: may add functionality to refund any remaining collateral after liquidation
        }

        if(loan.isRepaid){
            revert("Loan is already repaid");
        }

        int responseCode = hts.transferFrom(USDC_TOKEN_ADDRESS, msg.sender, address(assetCollateralReserve), uint256(uint64(loan.repayAmountUSDC)));

        if(responseCode != HederaResponseCodes.SUCCESS){
            revert("Failed to transfer USDC");
        }

        assetCollateralReserve.deposit(loan.repayAmountUSDC);

        responseCode = hts.transferFrom(token, address(asset), msg.sender, uint256(uint64(loan.collateralAmountAsset)));

        if(responseCode != HederaResponseCodes.SUCCESS){
            revert("Failed to transfer asset");
        }

        asset.repayLoan(msg.sender);


    }

    function liquidateLoan(string memory collateralizedAsset, address borrower) public {
        // actual liquidation of assets will be handled separately
        TokenizedAssetManager asset = issuer.tokenizedAssets(collateralizedAsset);
        TokenizedAssetManager.Loan memory loan = asset.getLoan(borrower);

        if(!loan.isOutstanding){
            revert("No outstanding loan for borrower");
        }

        if(loan.isLiquidated){
            revert("Loan is already liquidated");
        }

        if(loan.isRepaid){
            revert("Loan is already repaid");
        }

        asset.liquidateLoan(borrower);
        // handle actual liquidation of assets by burning and minting appropriately
    }

}