//SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.0;
 
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@opengsn/contracts/src/ERC2771Recipient.sol";

import "./Wormhole/ITokenBridge.sol";
import "./Wormhole/PortalWrappedToken.sol";

import "./Abacus/IOutbox.sol";

// import "hardhat/console.sol";

// interfaces to interact with abacus cross chain account

struct Call {
    address to;
    bytes data;
}

interface IInterchainAccountRouter {
    function dispatch(
        uint32 _destinationDomain,
        Call[] calldata calls
    ) external returns (uint256);
    function getInterchainAccount(
        uint32 _originDomain, 
        address _sender
    ) external returns (address);
}

contract Boomerang is ERC2771Recipient {

    // for gsn
    string public versionRecipient = "3.0.0";

    address tokenBridge;

    // for Abacus
    uint32 private fujiDomain = 43113;
    uint32 private bscDomain = 0x62732d74;
    address interchainRouter;


    constructor(address forwarder, address tokenBridgeAddress, address interchainRouterAddress) {
        _setTrustedForwarder(forwarder);
        tokenBridge = tokenBridgeAddress;
        interchainRouter = interchainRouterAddress;
    }

    // for the bridge
    uint32 nonce = 0;

    // functions to bridge
    function bridgeToken(address tokenToBridge, uint256 amt, uint16 receipientChainId, bytes32 recipient) public returns (uint64 sequence) {
        approveTokenBridge(tokenToBridge, amt);
        nonce += 1;
        return ITokenBridge(tokenBridge).transferTokens(tokenToBridge, amt, receipientChainId, recipient, 0, nonce);
    }

    function approveTokenBridge(address tokenToBridge, uint256 amt) public returns (bool) {
        if(IERC20(tokenToBridge).allowance(address(this), tokenBridge) < amt){
            IERC20(tokenToBridge).approve(tokenBridge, amt);
        }
    }

    // function to be call by the gsn relayer to send bridge + send a cross chain call
    function boom(address to, uint256 value, bytes calldata data, address bridgedToken, uint256 bridgedAmount) public payable{
        // require(IERC20(bridgedToken).allowance(msg.sender, address(this)) >= bridgedAmount, "Token to bridge not allowed");

        uint16 destChain = (fujiDomain == block.chainid) ? 4 : 6;
        address senderInterchainAccount = IInterchainAccountRouter(interchainRouter).getInterchainAccount(bscDomain, msg.sender);

        // // Take user's tokens 
        // IERC20(bridgedToken).transferFrom(msg.sender, address(this), bridgedAmount);
        // // Bridge tokens
        // bridgeToken(bridgedToken, bridgedAmount, destChain, bytes32(uint256(uint160(msg.sender)) << 96));

        // Send the cross chain transaction
        Call memory call = Call({
            to: to,
            data: data
        });
        Call[] memory theCall = new Call[](1);
        theCall[0] = call;

        IInterchainAccountRouter(interchainRouter).dispatch(
            // (fujiDomain == uint32(block.chainid)) ? bscDomain : fujiDomain,
            bscDomain,
            theCall
        ); 
    }

    fallback() external payable {
    }

    receive() external payable {
    }

}