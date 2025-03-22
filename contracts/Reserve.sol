// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "./system-contracts/hedera-token-service/IHederaTokenService.sol";
import "./system-contracts/HederaResponseCodes.sol";
import "./system-contracts/hedera-token-service/IHRC719.sol";

contract AssetCollateralReserve {
    address constant USDC_TOKEN_ADDRESS = address(0x40a);
    IHederaTokenService constant hts = IHederaTokenService(address(0x167));
    address asset;
    address issuer;
    address lender;
    uint256 public totalReserve;

    modifier onlyAdmin() {
        require(msg.sender == issuer || msg.sender == lender || msg.sender == address(this), "Only admin can call this function");
        _;
    }

    constructor(address _asset, address _issuer, address _lender) {
        uint256 responseCode = IHRC719(USDC_TOKEN_ADDRESS).associate(); // TODO: we might need to use a different token association mechanism
        if (int32(uint32(responseCode)) != HederaResponseCodes.SUCCESS) {
            revert("Failed to setup USDC token association");
        }
        asset = _asset;
        totalReserve = 0;
        issuer = _issuer;
        lender = _lender;
    }

    function deposit(uint64 amount) public {
        totalReserve += amount;
    }

    function withdraw(uint64 amount) public {
        totalReserve -= amount;
    }

    function grantAllowanceToIssuer(uint256 amount) private onlyAdmin() {
        int64 responseCode = hts.approve(USDC_TOKEN_ADDRESS, issuer, amount);
        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert("Failed to grant allowance to issuer");
        }
    }

    function grantAllowanceToLender(uint256 amount) private onlyAdmin() {
        int64 responseCode = hts.approve(USDC_TOKEN_ADDRESS, lender, amount);
        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert("Failed to grant allowance to lender");
        }
    }

    function refund(uint256 amount, address account) public onlyAdmin() {
        // if(msg.sender == lender){
        //     grantAllowanceToLender(amount);
        // } else if(msg.sender == issuer){
        //     grantAllowanceToIssuer(amount);
        // }
        int64 responseCode = hts.transferFrom(USDC_TOKEN_ADDRESS, address(this), account, amount);
        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert("Failed to refund");
        }
        totalReserve -= amount;
    }


}

interface IReserve {
    function createReserve(address asset) external;
}


contract Reserve {
    address public admin;
    address private issuer;
    address private lender;
    mapping(address => AssetCollateralReserve) public reserves;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function addControllers(address _issuer, address _lender) public onlyAdmin {
        issuer = _issuer;
        lender = _lender;
    }

    function createReserve(address asset) public onlyAdmin {
        reserves[asset] = new AssetCollateralReserve(asset, issuer, lender);
    }
}