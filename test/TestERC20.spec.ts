import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat"; 
import TestERC20Module from "../ignition/modules/TestERC20";
import { TestERC20 } from "../typechain-types"; 

// Constants for roles
const MINTER_ROLE = ethers.id("MINTER_ROLE");
const BURNER_ROLE = ethers.id("BURNER_ROLE");
const DEFAULT_ADMIN_ROLE = ethers.ZeroHash; 

const tokenName = "TestERC20";
const tokenSymbol = "TE20";
const tokenDecimals = 18;

describe("TestERC20", function () { 
  async function deployTestERC20Fixture() {
    // Get signers
    const [owner, addr1, addr2, otherAcc] = await ethers.getSigners();

    // Deploy TestERC20 module using Hardhat Ignition
    const { testERC20Proxy } = 
      await hre.ignition.deploy(TestERC20Module);
    
    // Get a typed instance of the contract
    const token = await ethers.getContractAt("TestERC20", await testERC20Proxy.getAddress()) as TestERC20;

    return { token, owner, addr1, addr2, otherAcc };
  }

  describe("Deployment and Initialization", function () {
    it("Should deploy with correct name, symbol, and decimals", async function () {
      const { token } = await loadFixture(deployTestERC20Fixture);
      expect(await token.name()).to.equal(tokenName);
      expect(await token.symbol()).to.equal(tokenSymbol);
      expect(await token.decimals()).to.equal(tokenDecimals);
    });

    it("Should assign initial roles correctly to the deployer", async function () {
      const { token, owner } = await loadFixture(deployTestERC20Fixture);
      expect(await token.getAddress()).to.be.properAddress; 
      expect(await token.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await token.hasRole(MINTER_ROLE, owner.address)).to.be.true;
      expect(await token.hasRole(BURNER_ROLE, owner.address)).to.be.true;
    });

    it("Should have an initial total supply of 0", async function () {
      const { token } = await loadFixture(deployTestERC20Fixture);
      expect(await token.totalSupply()).to.equal(ethers.parseUnits("0", tokenDecimals));
    });

    it("Should revert if trying to initialize again", async function () {
      const { token, owner } = await loadFixture(deployTestERC20Fixture);
      // Attempt to call initialize again on the already initialized contract
      await expect(
        token.initialize(owner.address, owner.address, owner.address)
      ).to.be.revertedWithCustomError(token, "InvalidInitialization");
      // For contracts not using custom errors or if the error string is known directly from OpenZeppelin:
      // .to.be.revertedWith("Initializable: contract is already initialized"); 
      // Note: OpenZeppelin UUPSUpgradeable contracts typically use custom errors for this.
      // We use `InvalidInitialization` as it's the standard error for this case in OZ contracts v5+.
    });
  });

  describe("Minting", function () {
    it("Should allow minter to mint tokens", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTestERC20Fixture);
      const amount = ethers.parseUnits("100", tokenDecimals);

      await expect(token.connect(owner).mint(addr1.address, amount))
        .to.emit(token, "Transfer")
        .withArgs(ethers.ZeroAddress, addr1.address, amount);

      expect(await token.balanceOf(addr1.address)).to.equal(amount);
      expect(await token.totalSupply()).to.equal(amount);
    });

    it("Should NOT allow non-minter to mint tokens", async function () {
      const { token, addr1, otherAcc } = await loadFixture(deployTestERC20Fixture);
      const amount = ethers.parseUnits("100", tokenDecimals);

      await expect(token.connect(addr1).mint(otherAcc.address, amount))
        .to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount")
        .withArgs(addr1.address, MINTER_ROLE);
    });

    it("Should revert minting to the zero address", async function () {
      const { token, owner } = await loadFixture(deployTestERC20Fixture);
      const amount = ethers.parseUnits("100", tokenDecimals);
      await expect(token.connect(owner).mint(ethers.ZeroAddress, amount))
        .to.be.revertedWithCustomError(token, "ERC20InvalidReceiver").withArgs(ethers.ZeroAddress);
    });
  });

  describe("ERC20 Standard Functionality", function () {
    let token: TestERC20;
    let owner: any, addr1: any, addr2: any; 
    const mintAmount = ethers.parseUnits("1000", tokenDecimals);

    beforeEach(async function () {
      const fixture = await loadFixture(deployTestERC20Fixture);
      token = fixture.token;
      owner = fixture.owner;
      addr1 = fixture.addr1;
      addr2 = fixture.addr2;
      await token.connect(owner).mint(owner.address, mintAmount);
    });

    it("Should return the correct totalSupply after minting", async function () {
      expect(await token.totalSupply()).to.equal(mintAmount);
    });

    it("Should return the correct balanceOf an account", async function () {
      expect(await token.balanceOf(owner.address)).to.equal(mintAmount);
    });

    describe("Transfer", function () {
      it("Should transfer tokens between accounts", async function () {
        const transferAmount = ethers.parseUnits("100", tokenDecimals);

        await expect(token.connect(owner).transfer(addr1.address, transferAmount))
          .to.emit(token, "Transfer")
          .withArgs(owner.address, addr1.address, transferAmount);

        expect(await token.balanceOf(owner.address)).to.equal(mintAmount - transferAmount);
        expect(await token.balanceOf(addr1.address)).to.equal(transferAmount);
      });

      it("Should revert if trying to transfer more than balance", async function () {
        const excessiveAmount = mintAmount + ethers.parseUnits("1", tokenDecimals);

        await expect(token.connect(owner).transfer(addr1.address, excessiveAmount))
          .to.be.revertedWithCustomError(token, "ERC20InsufficientBalance")
          .withArgs(owner.address, mintAmount, excessiveAmount);
      });

      it("Should revert if transferring to the zero address", async function () {
        const transferAmount = ethers.parseUnits("100", tokenDecimals);

        await expect(token.connect(owner).transfer(ethers.ZeroAddress, transferAmount))
          .to.be.revertedWithCustomError(token, "ERC20InvalidReceiver").withArgs(ethers.ZeroAddress);
      });
    });

    describe("Approve and Allowance", function () {
      it("Should approve an spender and update allowance", async function () {
        const approveAmount = ethers.parseUnits("200", tokenDecimals);

        await expect(token.connect(owner).approve(addr1.address, approveAmount))
          .to.emit(token, "Approval")
          .withArgs(owner.address, addr1.address, approveAmount);

        expect(await token.allowance(owner.address, addr1.address)).to.equal(approveAmount);
      });
    });

    describe("TransferFrom", function () {
      const approveAmount = ethers.parseUnits("200", tokenDecimals);

      beforeEach(async function () {
        await token.connect(owner).approve(addr1.address, approveAmount);
      });

      it("Should allow spender to transferFrom owner's account", async function () {
        const transferAmount = ethers.parseUnits("150", tokenDecimals);

        await expect(token.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount))
          .to.emit(token, "Transfer")
          .withArgs(owner.address, addr2.address, transferAmount);

        expect(await token.balanceOf(owner.address)).to.equal(mintAmount - transferAmount);
        expect(await token.balanceOf(addr2.address)).to.equal(transferAmount);
        expect(await token.allowance(owner.address, addr1.address)).to.equal(approveAmount - transferAmount);
      });

      it("Should revert if spender tries to transferFrom more than allowance", async function () {
        const excessiveAmount = approveAmount + ethers.parseUnits("1", tokenDecimals);

        await expect(token.connect(addr1).transferFrom(owner.address, addr2.address, excessiveAmount))
          .to.be.revertedWithCustomError(token, "ERC20InsufficientAllowance")
          .withArgs(addr1.address, approveAmount, excessiveAmount);
      });

      it("Should revert if spender tries to transferFrom more than owner's balance (even with allowance)", async function () {
        const newMintAmount = ethers.parseUnits("50", tokenDecimals);
        await token.connect(owner).mint(owner.address, newMintAmount); 
        const ownerInitialBalance = await token.balanceOf(owner.address);
        
        const largeApproveAmount = ownerInitialBalance + ethers.parseUnits("100", tokenDecimals);
        await token.connect(owner).approve(addr1.address, largeApproveAmount);
        
        const transferAmountExceedingBalance = ownerInitialBalance + ethers.parseUnits("1", tokenDecimals);

        await expect(token.connect(addr1).transferFrom(owner.address, addr2.address, transferAmountExceedingBalance))
          .to.be.revertedWithCustomError(token, "ERC20InsufficientBalance")
          .withArgs(owner.address, ownerInitialBalance, transferAmountExceedingBalance);
      });
    });
  });

  describe("Burning (Custom Function with BURNER_ROLE)", function () {
    const initialMintAmount = ethers.parseUnits("1000", tokenDecimals);

    it("Should allow burner to burn tokens from any account", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTestERC20Fixture);
      await token.connect(owner).mint(addr1.address, initialMintAmount); 
      
      const burnAmount = ethers.parseUnits("100", tokenDecimals);
      
      await expect(token.connect(owner)['burn(address,uint256)'](addr1.address, burnAmount)) 
        .to.emit(token, "Transfer")
        .withArgs(addr1.address, ethers.ZeroAddress, burnAmount);

      expect(await token.balanceOf(addr1.address)).to.equal(initialMintAmount - burnAmount);
      expect(await token.totalSupply()).to.equal(initialMintAmount - burnAmount);
    });

    it("Should NOT allow non-burner to burn tokens using custom burn function", async function () {
      const { token, owner, addr1, otherAcc } = await loadFixture(deployTestERC20Fixture);
      await token.connect(owner).mint(addr1.address, initialMintAmount);
      
      const burnAmount = ethers.parseUnits("100", tokenDecimals);

      await expect(token.connect(otherAcc)['burn(address,uint256)'](addr1.address, burnAmount))
        .to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount")
        .withArgs(otherAcc.address, BURNER_ROLE);
    });

    it("Should revert if trying to burn more tokens than an account has (custom burn)", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTestERC20Fixture);
      await token.connect(owner).mint(addr1.address, initialMintAmount);
      const excessiveBurnAmount = initialMintAmount + ethers.parseUnits("1", tokenDecimals);

      await expect(token.connect(owner)['burn(address,uint256)'](addr1.address, excessiveBurnAmount))
        .to.be.revertedWithCustomError(token, "ERC20InsufficientBalance")
        .withArgs(addr1.address, initialMintAmount, excessiveBurnAmount);
    });
  });

  describe("Burning (Standard ERC20Burnable Functions)", function () {
    const initialMintAmount = ethers.parseUnits("1000", tokenDecimals);

    describe("burn(uint256 amount)", function () {
      it("Should allow token holder to burn their own tokens", async function () {
        const { token, owner, addr1 } = await loadFixture(deployTestERC20Fixture);
        await token.connect(owner).mint(addr1.address, initialMintAmount);
        
        const burnAmount = ethers.parseUnits("100", tokenDecimals);
        
        await expect(token.connect(addr1)['burn(uint256)'](burnAmount))
          .to.emit(token, "Transfer")
          .withArgs(addr1.address, ethers.ZeroAddress, burnAmount);

        expect(await token.balanceOf(addr1.address)).to.equal(initialMintAmount - burnAmount);
        expect(await token.totalSupply()).to.equal(initialMintAmount - burnAmount);
      });

      it("Should revert if holder tries to burn more than their balance (standard burn)", async function () {
        const { token, owner, addr1 } = await loadFixture(deployTestERC20Fixture);
        await token.connect(owner).mint(addr1.address, initialMintAmount);
        const excessiveBurnAmount = initialMintAmount + ethers.parseUnits("1", tokenDecimals);

        await expect(token.connect(addr1)['burn(uint256)'](excessiveBurnAmount))
          .to.be.revertedWithCustomError(token, "ERC20InsufficientBalance")
          .withArgs(addr1.address, initialMintAmount, excessiveBurnAmount);
      });
    });

    describe("burnFrom(address account, uint256 amount)", function () {
      const approveAmount = ethers.parseUnits("500", tokenDecimals);

      it("Should allow spender to burn tokens from an approved account", async function () {
        const { token, owner, addr1 } = await loadFixture(deployTestERC20Fixture);
        await token.connect(owner).mint(owner.address, initialMintAmount); 
        await token.connect(owner).approve(addr1.address, approveAmount); 
        
        const burnAmount = ethers.parseUnits("200", tokenDecimals);
        
        await expect(token.connect(addr1).burnFrom(owner.address, burnAmount))
          .to.emit(token, "Transfer")
          .withArgs(owner.address, ethers.ZeroAddress, burnAmount);

        expect(await token.balanceOf(owner.address)).to.equal(initialMintAmount - burnAmount);
        expect(await token.allowance(owner.address, addr1.address)).to.equal(approveAmount - burnAmount);
        expect(await token.totalSupply()).to.equal(initialMintAmount - burnAmount);
      });

      it("Should revert if spender tries to burnFrom more than allowance", async function () {
        const { token, owner, addr1 } = await loadFixture(deployTestERC20Fixture);
        await token.connect(owner).mint(owner.address, initialMintAmount);
        await token.connect(owner).approve(addr1.address, approveAmount);
        const excessiveBurnAmount = approveAmount + ethers.parseUnits("1", tokenDecimals);

        await expect(token.connect(addr1).burnFrom(owner.address, excessiveBurnAmount))
          .to.be.revertedWithCustomError(token, "ERC20InsufficientAllowance")
          .withArgs(addr1.address, approveAmount, excessiveBurnAmount);
      });

      it("Should revert if spender tries to burnFrom more than account's balance (even with allowance)", async function () {
        const { token, owner, addr1 } = await loadFixture(deployTestERC20Fixture);
        const smallMintAmount = ethers.parseUnits("100", tokenDecimals);
        await token.connect(owner).mint(owner.address, smallMintAmount); 
        await token.connect(owner).approve(addr1.address, approveAmount); 
        
        const burnAmountExceedingBalance = smallMintAmount + ethers.parseUnits("1", tokenDecimals);

        await expect(token.connect(addr1).burnFrom(owner.address, burnAmountExceedingBalance))
          .to.be.revertedWithCustomError(token, "ERC20InsufficientBalance")
          .withArgs(owner.address, smallMintAmount, burnAmountExceedingBalance);
      });
    });
  });
});
