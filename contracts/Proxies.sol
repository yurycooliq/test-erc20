// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

/**
 * Because we're using the OpenZeppelin proxy contracts, we need to import them here to make sure Hardhat knows to compile them. 
 * This will ensure that their artifacts are available for Hardhat Ignition to use later when we're writing our Ignition modules.
 * https://hardhat.org/ignition/docs/guides/upgradeable-proxies
 */