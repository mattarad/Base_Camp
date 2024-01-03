const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  describe("FunctionTestERC721", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    deployFunctionTestERC721Contract = async () => {
  
      // Contracts are deployed using the first signer/account by default
      const [ owner, otherAccount, acctTwo, acctThree ] = await ethers.getSigners();
      const FunctionTestERC721 = await ethers.getContractFactory("FunctionTestERC721");
      const ft = await FunctionTestERC721.deploy()
      return { ft, owner, otherAccount, acctTwo, acctThree };
    }
    describe("Deployment", async () => {
      it("Doesn't deploy to Address(0)", async () => {
        const { ft, owner, otherAccount, acctTwo, acctThree } = await loadFixture(deployFunctionTestERC721Contract);
        expect(ft.target).to.not.eq(0x0000000000000000000000000000000000000000)
        //
      })
    })
    describe('minting',async () => {
        it("minting", async () => {
            const { ft, owner } = await loadFixture(deployFunctionTestERC721Contract);
            let address = await owner.getAddress()
            let amount = 500
            let nfts = []
            await ft.connect(owner).mint(amount)

            let balOf = await ft.balanceOf(address)
            let owned = await ft.getOwned(address)
            for(let i = 1; i <= amount; i++) nfts.push(i)

            let totalSupply = await ft.totalSupply()

            owned.forEach((nft, index) => {
                expect(nft).to.eq(nfts[index])
            });
        })
        it("safeBatchTransfer works / updated owned[msg.sender] token array", async () => {
            const { ft, owner, otherAccount } = await loadFixture(deployFunctionTestERC721Contract);
            let address = await owner.getAddress()
            let otherAddress = await otherAccount.getAddress()

            let amount = 500
            let nfts = []
            await ft.connect(owner).mint(amount)

            let balOf = await ft.balanceOf(address)
            console.log(balOf)

            let owned_pre_tx = await ft.getOwned(address)
            let owned_pre_tx_other = await ft.getOwned(otherAddress)
            console.log('owned_pre_tx')
            console.log(owned_pre_tx)
            console.log('owned_pre_tx_other')
            console.log(owned_pre_tx_other)

            let tokens_to_tx = [5, 7, 10]

            await ft.connect(owner).safeBatchTransfer(otherAddress, tokens_to_tx)

            let owned_post_tx = await ft.getOwned(address)
            let owned_post_tx_other = await ft.getOwned(otherAddress)
            console.log('owned_post_tx')
            console.log(owned_post_tx)
            console.log('owned_post_tx_other')
            console.log(owned_post_tx_other)


        })
    })

});
