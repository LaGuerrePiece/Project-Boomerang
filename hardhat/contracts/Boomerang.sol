//SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.0;
 
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@opengsn/contracts/src/ERC2771Recipient.sol";

import "./Stargate/IStargateRouter.sol";

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
    ) external;
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
    uint32 private mumbaiDomain = 80001;
    uint32 private bscDomain = 0x62732d74;
    address interchainRouter;


    constructor(address forwarder, address tokenBridgeAddress, address interchainRouterAddress) {
        _setTrustedForwarder(forwarder);
        tokenBridge = tokenBridgeAddress;
        interchainRouter = interchainRouterAddress;
    }

    // functions to bridge with wormhole
    // function bridgeToken(address tokenToBridge, uint256 amt, uint16 receipientChainId, address recipient) public returns (uint64 sequence) {
    //     approveTokenBridge(tokenToBridge, amt);
    //     nonce += 1;
    //     return ITokenBridge(tokenBridge).transferTokens(tokenToBridge, amt, receipientChainId, recipient, 0, nonce);

    // }

    //bridge with Axelar
    function bridgeToken(address tokenToBridge, uint256 amt, address recipient) payable public {
        approveTokenBridge(tokenToBridge, amt);
        // perform a Stargate swap() in a solidity smart contract function
        // the msg.value is the "fee" that Stargate needs to pay for the cross chain message
        IStargateRouter(tokenBridge).swap{value:msg.value}(
            10002,                           // send to Fuji (use LayerZero chainId)
                1,                               // source pool id
                2,                               // dest pool id                 
            payable(msg.sender),                      // refund adddress. extra gas (if any) is returned to this address
            amt,                             // quantity to swap
            amt - amt / 10,                    // the min qty you would accept on the destination
            IStargateRouter.lzTxObj(0, 0, "0x"),  // 0 additional gasLimit increase, 0 airdrop, at 0x address
            abi.encodePacked(recipient),    // the address to send the tokens to on the destination
            bytes("")                        // bytes param, if you wish to send additional payload you can abi.encode() them here
        );
        
    }

    function approveTokenBridge(address tokenToBridge, uint256 amt) public returns (bool) {
        if(IERC20(tokenToBridge).allowance(address(this), tokenBridge) < amt){
            IERC20(tokenToBridge).approve(tokenBridge, amt);
        }
    }

    // function to be call by the gsn relayer to send bridge + send a cross chain call
    function boom(address to, bytes calldata data, address bridgedToken, uint256 bridgedAmount) public payable{
        require(IERC20(bridgedToken).allowance(msg.sender, address(this)) >= bridgedAmount, "Token to bridge not allowed");
        // uint32 destChain = (fujiDomain == block.chainid) ? bscDomain : fujiDomain;
        address senderInterchainAccount = IInterchainAccountRouter(interchainRouter).getInterchainAccount(mumbaiDomain, msg.sender);

        // Take user's tokens 
        IERC20(bridgedToken).transferFrom(msg.sender, address(this), bridgedAmount);
        // Bridge tokens
        bridgeToken(bridgedToken, bridgedAmount, msg.sender);

        // Send the cross chain transaction
        IERC20 targetToken = IERC20(0xF49E250aEB5abDf660d643583AdFd0be41464EfD);
        Call memory app = Call({
            to: 0xF49E250aEB5abDf660d643583AdFd0be41464EfD,
            data: abi.encodeCall(targetToken.approve, (to, bridgedAmount))
        }); // approve

        Call memory call = Call({
            to: to,
            data: data
        });
        Call[] memory theCall = new Call[](2);
        theCall[0] = app;
        theCall[1] = call;

        IInterchainAccountRouter(interchainRouter).dispatch(
            mumbaiDomain,
            theCall
        ); 
    }

    fallback() external payable {
    }

    receive() external payable {
    }


function toString(bytes memory data) public pure returns(string memory) {
    bytes memory alphabet = "0123456789abcdef";

    bytes memory str = new bytes(2 + data.length * 2);
    str[0] = "0";
    str[1] = "x";
    for (uint i = 0; i < data.length; i++) {
        str[2+i*2] = alphabet[uint(uint8(data[i] >> 4))];
        str[3+i*2] = alphabet[uint(uint8(data[i] & 0x0f))];
    }
    return string(str);
}
}