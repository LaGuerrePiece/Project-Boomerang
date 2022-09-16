//SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.0;
 
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@opengsn/contracts/src/ERC2771Recipient.sol";

import "./Wormhole/ITokenBridge.sol";
import "./Wormhole/PortalWrappedToken.sol";

import "./Abacus/IOutbox.sol";

import "hardhat/console.sol";

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
    string public override versionRecipient = "3.0.0";

    ITokenBridge token_bridge;

    // for Abacus
    uint32 private fujiDomain = 43113;
    uint32 private mumbaiDomain = 80001;
    IInterchainAccountRouter interchainRouter;


    constructor(address forwarder, address tokenBridgeAddress, address interchainRouterAddress) {
        _setTrustedForwarder(forwarder);
        token_bridge = ITokenBridge(tokenBridgeAddress);
        interchainRouter = IInterchainAccountRouter(interchainRouterAddress);
    }

    // for the bridge
    uint32 nonce = 0;

    // functions to bridge
    function bridgeToken(address tokenToBridge, uint256 amt, uint16 receipientChainId, bytes32 recipient) public returns (uint64 sequence) {
        approveTokenBridge(tokenToBridge, amt);
        nonce += 1;
        return token_bridge.transferTokens(TKN_address, amt, receipientChainId, recipient, 0, nonce);
    }

    function approveTokenBridge(address tokenToBridge, uint256 amt) public returns (bool) {
        if(IERC20(tokenToBridge).allowance(address(this), token_bridge_address < amt)){
            IERC20(tokenToBridge).approve(token_bridge_address, amt);
        }
    }

    // function to be call by the gsn relayer to send bridge + send a cross chain call
    function boom(address to, uint256 value, bytes calldata data) public payable{
        uint32 destChain = (fujiDomain == block.chainid) ? mumbaiDomain : fujiDomain;
        address senderInterchainAccount = interchainRouter.getInterchainAccount(destChain, msg.sender);

        // To do : bridge

        // To do: send cross chain transaction

    }


    fallback() external payable {
    }

    receive() external payable {
    }

}