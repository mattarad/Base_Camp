const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  describe("UnburnableToken", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    deployUnburnableTokenContract = async () => {
      // Contracts are deployed using the first signer/account by default
      const [ owner, otherAccount, acctTwo, acctThree ] = await ethers.getSigners();
    //   const TOTAL_SUPPLY = 100000000
      const TOTAL_SUPPLY = 1000000 // for faster testing on 'claiming' 

      const CLAIM_AMOUNT = 1000

      const UnburnableToken = await ethers.getContractFactory("UnburnableToken");
      const unburn = await UnburnableToken.deploy()
      return { unburn, TOTAL_SUPPLY, CLAIM_AMOUNT, owner, otherAccount, acctTwo, acctThree };
    }
    describe("Deployment", async () => {
      it("Doesn't deploy to Address(0)", async () => {
        const { unburn } = await loadFixture(deployUnburnableTokenContract);
        expect(unburn.target).to.not.eq(0x0000000000000000000000000000000000000000)
      })
      it("check initialized total supply", async () => {
        const { unburn, TOTAL_SUPPLY } = await loadFixture(deployUnburnableTokenContract);
        let total_supply = await unburn.totalSupply()
        expect(total_supply).to.eq(TOTAL_SUPPLY)
      })
      it("check initialized claim amount", async () => {
        const { unburn, CLAIM_AMOUNT } = await loadFixture(deployUnburnableTokenContract);
        let claim_amount = await unburn.claimAmount()
        let total_claimed = await unburn.totalClaimed()
        expect(claim_amount).to.eq(CLAIM_AMOUNT)
        expect(total_claimed).to.eq(0)
      })
    })
    describe('claiming',async () => {
        // TEST TAKES A WHILE
        // creates 100,010 accounts
        // transfers 100 eth to each account
        // calls .claim()
        // check total supply and claim amount
        // checks if the claim() call should pass or fail based on totalSupply()
        it("it allows users to claim / it reverts if total claimed is >= total supply", async () => {
            const { unburn, TOTAL_SUPPLY, CLAIM_AMOUNT, owner, otherAccount } = await loadFixture(deployUnburnableTokenContract);
            let claimed = 0
            // if total supply is left unchanged then this will take too long.
            let call_amount = TOTAL_SUPPLY / CLAIM_AMOUNT + 10
            let call_error = false
            for(let i = 0; i < call_amount; i++) {
                let signer = await ethers.getImpersonatedSigner(ethers.Wallet.createRandom().address)
                let address = await signer.getAddress()

                await ethers.provider.send("hardhat_setBalance", [
                    address,
                    "0x56BC75E2D63100000", // 100 ETH
                ]);
                
                // let total_claimed = await unburn.totalClaimed()
                if(claimed < TOTAL_SUPPLY) {
                    claimed += CLAIM_AMOUNT
                    await unburn.connect(signer).claim()
                    // total_claimed = await unburn.totalClaimed()
                    // expect(total_claimed).to.eq(claimed)
                    let user_bal = await unburn.balances(address)
                    expect(user_bal).to.eq(CLAIM_AMOUNT)
                } else {
                    await expect(unburn.connect(signer).claim()).to.be.revertedWithCustomError(unburn, "AllTokensClaimed")
                    call_error = true
                }
                console.log(`${i} / ${call_amount}`)
                console.log(`call error: ${call_error}`)
            }
        })
        it("it updates balances and totalClaimed after claim", async () => {
            const { unburn, TOTAL_SUPPLY, CLAIM_AMOUNT, owner, otherAccount } = await loadFixture(deployUnburnableTokenContract);
            let claimed = 0
            
            await unburn.connect(owner).claim()
            claimed += CLAIM_AMOUNT

            await unburn.connect(otherAccount).claim()
            claimed += CLAIM_AMOUNT


            let ownerAddress = await owner.getAddress()
            let otherAddress = await otherAccount.getAddress()

            let owner_bal = await unburn.balances(ownerAddress)
            let other_bal = await unburn.balances(otherAddress)

            expect(owner_bal).to.eq(CLAIM_AMOUNT)
            expect(other_bal).to.eq(CLAIM_AMOUNT)

            let total_claimed= await unburn.totalClaimed()

            expect(total_claimed).to.eq(claimed)
        })
    })

    describe('token transfer', () => {
        it("allows users to transfer tokens and correctly update balances", async () => {
            const { unburn, TOTAL_SUPPLY, CLAIM_AMOUNT, owner, otherAccount, acctTwo, acctThree } = await loadFixture(deployUnburnableTokenContract);
            let owner_address = await owner.getAddress()
            let other_address = await otherAccount.getAddress()
            let two_address = await acctTwo.getAddress()
            let three_address = await acctThree.getAddress()
            await unburn.connect(owner).claim()
            await unburn.connect(otherAccount).claim()

            let own_bal = await unburn.balances(owner_address)
            let other_bal = await unburn.balances(other_address)

            expect(own_bal).to.eq(CLAIM_AMOUNT)
            expect(other_bal).to.eq(CLAIM_AMOUNT)

            await unburn.connect(owner).safeTransfer(two_address, CLAIM_AMOUNT)
            await unburn.connect(otherAccount).safeTransfer(three_address, CLAIM_AMOUNT)

            own_bal = await unburn.balances(owner_address)
            other_bal = await unburn.balances(other_address)
            let two_bal = await unburn.balances(two_address)
            let three_bal = await unburn.balances(three_address)

            expect(own_bal).to.eq(0)
            expect(other_bal).to.eq(0)
            expect(two_bal).to.eq(CLAIM_AMOUNT)
            expect(three_bal).to.eq(CLAIM_AMOUNT)
        })
    })

});
