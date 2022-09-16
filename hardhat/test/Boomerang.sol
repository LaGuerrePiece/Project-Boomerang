//SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.9;
 
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "@opengsn/contracts/src/ERC2771Recipient.sol";

import "hardhat/console.sol";

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

    string public override versionRecipient = "3.0.0";

    constructor(address forwarder) {
        _setTrustedForwarder(forwarder);
    }

    fallback() external payable {
    }

    receive() external payable {
    }

}