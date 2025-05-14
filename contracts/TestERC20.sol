// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {ERC20BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title TestERC20 Token
 * @author Yuri Cooliq
 * @notice This contract implements a UUPS upgradeable ERC20 token with minting and burning capabilities,
 * controlled by specific roles (MINTER_ROLE, BURNER_ROLE) via OpenZeppelin's AccessControlUpgradeable.
 * It is initialized with a default admin, minter, and burner.
 */
contract TestERC20 is
    Initializable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable,
    AccessControlUpgradeable
{
    /**
     * @notice Role identifier for addresses authorized to mint new tokens.
     */
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    /**
     * @notice Role identifier for addresses authorized to burn tokens from any account.
     */
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    /// @custom:oz-upgrades-unsafe-allow constructor
    /**
     * @dev Initializes the contract, disabling the constructor for upgradeability.
     * The `_disableInitializers` function is called to prevent reinitialization after deployment.
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializes the TestERC20 contract.
     * @dev Sets up the token name, symbol, access control roles (DEFAULT_ADMIN, MINTER, BURNER).
     * This function can only be called once due to the `initializer` modifier.
     * @param defaultAdmin The address to be granted the DEFAULT_ADMIN_ROLE.
     * @param minter The address to be granted the MINTER_ROLE.
     * @param burner The address to be granted the BURNER_ROLE.
     */
    function initialize(
        address defaultAdmin,
        address minter,
        address burner
    ) public initializer {
        __ERC20_init("TestERC20", "TE20");
        __ERC20Burnable_init();
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, minter);
        _grantRole(BURNER_ROLE, burner);
    }

    /**
     * @notice Mints new tokens and assigns them to a specified address.
     * @dev Can only be called by an address with the MINTER_ROLE.
     * Emits a {Transfer} event with `from` set to the zero address.
     * @param to The address that will receive the minted tokens.
     * @param amount The amount of tokens to mint.
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    /**
     * @notice Burns a specified amount of tokens from a given address.
     * @dev Can only be called by an address with the BURNER_ROLE.
     * This function allows a privileged burner to remove tokens from any account, differing from the standard `burn(uint256 amount)`
     * which burns tokens from `msg.sender` and `burnFrom(address account, uint256 amount)` which requires an allowance.
     * Emits a {Transfer} event with `to` set to the zero address.
     * @param from The address whose tokens will be burned.
     * @param amount The amount of tokens to burn.
     */
    function burn(address from, uint256 amount) public onlyRole(BURNER_ROLE) {
        _burn(from, amount);
    }
}
