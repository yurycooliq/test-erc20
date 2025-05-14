import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { network } from "hardhat";

// Deployment module
const TestERC20Module = buildModule("TestERC20Module", (m) => {
  // Get contract params
  const DEFAULT_ADMIN_ADDRESS = network.name !== 'mainnet'
    ? m.getAccount(0) 
    : process.env.DEFAULT_ADMIN_ADDRESS as string;
  const MINTER_ADDRESS = network.name !== 'mainnet' 
    ? m.getAccount(0) 
    : process.env.MINTER_ADDRESS as string;
  const BURNER_ADDRESS = network.name !== 'mainnet' 
    ? m.getAccount(0) 
    : process.env.BURNER_ADDRESS as string;
  // Deploy implementation and proxy admin contracts
  const implementation = m.contract("TestERC20");
  const proxyAdmin = m.contract("ProxyAdmin", [DEFAULT_ADMIN_ADDRESS]);

  // Encode proxy initialization parameters
  const encoded = m.encodeFunctionCall(
    implementation,
    'initialize',
    [
      DEFAULT_ADMIN_ADDRESS,
      MINTER_ADDRESS,
      BURNER_ADDRESS,
    ]
  )

  // Deploy and initialize proxy
  const testERC20 = m.contract(
    "TransparentUpgradeableProxy",
    [
      implementation,
      proxyAdmin,
      encoded,
    ]
  );
  
  const testERC20Proxy = m.contractAt("TestERC20", testERC20, { id: "TestERC20Proxy" });

  return {
    testERC20,
    testERC20Proxy,
    proxyAdmin,
    implementation
  };
});

export default TestERC20Module;
