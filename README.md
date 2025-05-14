# Upgradeable Mintable/Burnable ERC20 Token

This project implements an upgradeable ERC20 token with minting and burning functionalities, fulfilling the requirements of a test task. The contract is built using Hardhat and OpenZeppelin libraries.

## Design Choices

*   **Contract:** The core logic is implemented in `contracts/TestERC20.sol`.
*   **ERC20 Standard:** Utilizes OpenZeppelin's `ERC20Upgradeable` for standard ERC20 functionality and `ERC20BurnableUpgradeable` for standard burn capabilities.
*   **Upgradeability:** The contract employs the UUPS (Universal Upgradeable Proxy Standard) pattern via OpenZeppelin's `UUPSUpgradeable`. This modern and gas-efficient proxy pattern allows for logic updates without changing the contract's address. Deployment is managed by Hardhat Ignition (`ignition/modules/TestERC20Module.ts`).
*   **Access Control:** Access to sensitive functions (minting and custom burning) is managed by OpenZeppelin's `AccessControlUpgradeable`.
    *   `MINTER_ROLE`: Grants permission to mint new tokens.
    *   `BURNER_ROLE`: Grants permission for the custom burn function.
    *   Upon deployment, the deployer account is granted `DEFAULT_ADMIN_ROLE`, `MINTER_ROLE`, and `BURNER_ROLE`.
*   **Minting Function (`mint(address to, uint256 amount)`):**
    *   Allows an account with `MINTER_ROLE` to create and assign new tokens.
*   **Burning Functions:**
    *   **Custom `burn(address from, uint256 amount)`:** Allows an account with `BURNER_ROLE` to burn tokens from any specified address. This provides administrative control over token supply reduction.
    *   **Standard `burn(uint256 amount)`:** (from `ERC20BurnableUpgradeable`) Allows any token holder to burn their own tokens.
    *   **Standard `burnFrom(address account, uint256 amount)`:** (from `ERC20BurnableUpgradeable`) Allows an address with an approved allowance to burn tokens on behalf of another account.
*   **Testing:** Comprehensive tests are located in the `test/` directory (`test/TestERC20.spec.ts`), developed using Hardhat, Ethers.js, and Chai. The tests cover deployment, role assignments, minting, all burn variations, and standard ERC20 operations, aiming for high code coverage.
*   **Documentation:**
    *   The contract includes inline Natspec comments for all functions and state variables.
    *   Detailed API documentation and further explanations are available in [docs/index.md](./docs/index.md).

## Project Structure

```
.
├── contracts/            # Solidity smart contracts (TestERC20.sol)
├── docs/                 # Detailed documentation (index.md)
├── ignition/             # Hardhat Ignition deployment modules
├── node_modules/         # Project dependencies
├── test/                 # Contract tests (TestERC20.spec.ts)
├── .env.example          # Example environment variables
├── .env                  # Environment variables (Git-ignored)
├── .gitignore
├── hardhat.config.ts     # Hardhat configuration
├── package.json
├── README.md             # This file
└── tsconfig.json
```

## How to Use

1.  **Clone the repository.**
2.  **Install dependencies:**
    ```shell
    yarn install
    ```
3.  **Compile contracts:**
    ```shell
    yarn compile
    ```
4.  **Run tests:**
    ```shell
    yarn test
    ```
5.  **Check test coverage (optional):**
    ```shell
    yarn coverage
    ```
6.  **Deploy to a local Hardhat node:**
    First, start a local node:
    ```shell
    npx hardhat node
    ```
    Then, in a separate terminal, deploy the contract module:
    ```shell
    yarn deploy:localhost
    ```
7.  **Deploy to a testnet/mainnet:**
    Ensure your `.env` file is configured with the appropriate `RPC_URL` and `PRIVATE_KEY` for the desired network (e.g., Sepolia).
    ```shell
    yarn deploy:sepolia
    ```

## Detailed Documentation

For a comprehensive understanding of the contract's API, functions, and events, please refer to the [Detailed Documentation](./docs/index.md).
