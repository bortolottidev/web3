const { expect } = require("chai");
const {ethers} = require("hardhat");

describe("DanieleToken contract", () => {

    describe("Deployment", () => {
        it("Should assign total supply to the owner during deployment", async () => {

        const [ owner ] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("DanieleToken");
        const danieleToken = await Token.deploy();

        const ownerBalance = await danieleToken.balanceOf(owner.address);
        expect(await danieleToken.totalSupply()).to.equal(ownerBalance);
        })

        it("Should set deployer as owner", async () => {
            const [ owner ] = await ethers.getSigners();
            const Token = await ethers.getContractFactory("DanieleToken");
            const danieleToken = await Token.deploy();

            // deployed!
            expect(await danieleToken.owner()).to.equal(owner.address);
        })
    })

describe("Transaction", function () {

    let Token;
    let danieleToken;
    let owner, address1, address2;
    
    beforeEach(async () => {
        [ owner, address1, address2 ] = await ethers.getSigners();

        Token = await ethers.getContractFactory("DanieleToken");
        danieleToken = await Token.deploy();
    })

    it("Should transfer token between account", async function () {

        // transfer 20 token to first address
        await danieleToken.transfer(address1.address, 20);
        expect(await danieleToken.balanceOf(address1.address)).to.equal(20);

        // transfer 50 token to second address
        await danieleToken.transfer(address2.address, 50);
        expect(await danieleToken.balanceOf(address2.address)).to.equal(50);
    })

    it("Should fail and revert if sender doesnt have enought tokens", async () => {
        const [initialBalanceOfSender, initialBalanceOfReceiver] = 
            await Promise.all([
                danieleToken.balanceOf(address1.address),
                danieleToken.balanceOf(owner.address),
            ]);

        // should throw 
        await expect(
               danieleToken.connect(address1).transfer(owner.address, 1)
        ).to.be.revertedWith("Not enought money, broz");

        // balances should be equal
        expect(await danieleToken.balanceOf(address1.address)).to.equal(initialBalanceOfSender);
        expect(await danieleToken.balanceOf(owner.address)).to.equal(initialBalanceOfReceiver);
    })

    it("Should update balances after transfer", async () => {
        const [ownerBalance, addr1Balance, addr2Balance] = 
            await Promise.all([
                danieleToken.balanceOf(owner.address),
                danieleToken.balanceOf(address1.address),
                danieleToken.balanceOf(address2.address),
            ]);

        await danieleToken.connect(owner).transfer(address1.address, 350);

        await danieleToken.connect(owner).transfer(address2.address, 150);

        // balances should be equal
        expect(await danieleToken.balanceOf(owner.address)).to.equal(ownerBalance - 500);
        expect(await danieleToken.balanceOf(address1.address)).to.equal(addr1Balance + 350);
        expect(await danieleToken.balanceOf(address2.address)).to.equal(addr2Balance + 150);
    })
})

})
