# Solidity API

## TestERC20

This contract implements a UUPS upgradeable ERC20 token with minting and burning capabilities,
controlled by specific roles (MINTER_ROLE, BURNER_ROLE) via OpenZeppelin's AccessControlUpgradeable.
It is initialized with a default admin, minter, and burner.

### MINTER_ROLE

```solidity
bytes32 MINTER_ROLE
```

Role identifier for addresses authorized to mint new tokens.

### BURNER_ROLE

```solidity
bytes32 BURNER_ROLE
```

Role identifier for addresses authorized to burn tokens from any account.

### constructor

```solidity
constructor() public
```

_Initializes the contract, disabling the constructor for upgradeability.
The `_disableInitializers` function is called to prevent reinitialization after deployment._

### initialize

```solidity
function initialize(address defaultAdmin, address minter, address burner) public
```

Initializes the TestERC20 contract.

_Sets up the token name, symbol, access control roles (DEFAULT_ADMIN, MINTER, BURNER).
This function can only be called once due to the `initializer` modifier._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| defaultAdmin | address | The address to be granted the DEFAULT_ADMIN_ROLE. |
| minter | address | The address to be granted the MINTER_ROLE. |
| burner | address | The address to be granted the BURNER_ROLE. |

### mint

```solidity
function mint(address to, uint256 amount) public
```

Mints new tokens and assigns them to a specified address.

_Can only be called by an address with the MINTER_ROLE.
Emits a {Transfer} event with `from` set to the zero address._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | The address that will receive the minted tokens. |
| amount | uint256 | The amount of tokens to mint. |

### burn

```solidity
function burn(address from, uint256 amount) public
```

Burns a specified amount of tokens from a given address.

_Can only be called by an address with the BURNER_ROLE.
This function allows a privileged burner to remove tokens from any account, differing from the standard `burn(uint256 amount)`
which burns tokens from `msg.sender` and `burnFrom(address account, uint256 amount)` which requires an allowance.
Emits a {Transfer} event with `to` set to the zero address._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from | address | The address whose tokens will be burned. |
| amount | uint256 | The amount of tokens to burn. |

