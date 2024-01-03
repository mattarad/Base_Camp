const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  describe("HaikuNFT", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    deployHaikuNFTContract = async () => {
      // Contracts are deployed using the first signer/account by default
      const [ owner, otherAccount, acctTwo, acctThree ] = await ethers.getSigners();
      const HAIKU_DATA = require('../data/haiku_data.json')
      const HaikuNFT = await ethers.getContractFactory("HaikuNFT");
      const hnft = await HaikuNFT.deploy()
      return { hnft, HAIKU_DATA, owner, otherAccount, acctTwo, acctThree };
    }
    describe("Deployment", async () => {
      it("Doesn't deploy to Address(0)", async () => {
        const { hnft } = await loadFixture(deployHaikuNFTContract);
        expect(hnft.target).to.not.eq(0x0000000000000000000000000000000000000000)
      })
      it("burns the zeroth haiku", async () => {
        const { hnft } = await loadFixture(deployHaikuNFTContract);
        let zeroth = await hnft.haiku(0)
        expect(zeroth[0]).to.eq('0x0000000000000000000000000000000000000000')
        expect(zeroth[1]).to.eq("")
        expect(zeroth[2]).to.eq("")
        expect(zeroth[3]).to.eq("")
      })
      it("inits counter to 1", async () => {
        const { hnft } = await loadFixture(deployHaikuNFTContract);
        let counter = await hnft.counter()
        expect(counter).to.eq(1)
      })
    })
    describe('minting haiku',async () => {
        it("allows users to mint with unique lines", async () => {
            const { hnft, HAIKU_DATA, owner, otherAccount } = await loadFixture(deployHaikuNFTContract);
            let counter = await hnft.counter()

            await hnft.mintHaiku(HAIKU_DATA[0].line_one, HAIKU_DATA[0].line_two, HAIKU_DATA[0].line_three)
            let address = await owner.getAddress()
            let haiku = await hnft.haiku(counter)

            expect(haiku[0]).to.eq(address)
            expect(haiku[1]).to.eq(HAIKU_DATA[0].line_one)
            expect(haiku[2]).to.eq(HAIKU_DATA[0].line_two)
            expect(haiku[3]).to.eq(HAIKU_DATA[0].line_three)
        })
        it("check if lines have been used", async () => {
            const { hnft, HAIKU_DATA, owner, otherAccount } = await loadFixture(deployHaikuNFTContract);
            await hnft.mintHaiku(HAIKU_DATA[0].line_one, HAIKU_DATA[0].line_two, HAIKU_DATA[0].line_three)
            let line_one = await hnft.checkLineUsed(HAIKU_DATA[0].line_one)
            let line_two = await hnft.checkLineUsed(HAIKU_DATA[0].line_two)
            let line_three = await hnft.checkLineUsed(HAIKU_DATA[0].line_three)

            expect(line_one).to.eq(true)
            expect(line_two).to.eq(true)
            expect(line_three).to.eq(true)

            for(let i = 0; i < HAIKU_DATA.length; i++) {
                line_one = await hnft.checkLineUsed(HAIKU_DATA[i].line_one)
                line_two = await hnft.checkLineUsed(HAIKU_DATA[i].line_two)
                line_three = await hnft.checkLineUsed(HAIKU_DATA[i].line_three)
                if(i == 0) {
                    expect(line_one).to.eq(true)
                    expect(line_two).to.eq(true)
                    expect(line_three).to.eq(true)
                } else {
                    expect(line_one).to.eq(false)
                    expect(line_two).to.eq(false)
                    expect(line_three).to.eq(false)
                }
            }

        })

        it("reverts with custom error if line(s) used", async () => {
            const { hnft, HAIKU_DATA } = await loadFixture(deployHaikuNFTContract);

            await hnft.mintHaiku(HAIKU_DATA[1].line_one, HAIKU_DATA[1].line_two, HAIKU_DATA[1].line_three)

            await expect(hnft.mintHaiku(HAIKU_DATA[0].line_one, HAIKU_DATA[1].line_two, HAIKU_DATA[0].line_three))
            .to.be.revertedWithCustomError(hnft, "HaikuNotUnique")

        })
        describe('sharing haiku', () => {
            it("allows author of Haiku to share the haiku", async () => {
                const { hnft, HAIKU_DATA, owner, otherAccount } = await loadFixture(deployHaikuNFTContract);
                let address = await otherAccount.getAddress()
                let addressOwner = await owner.getAddress()

                await hnft.mintHaiku(HAIKU_DATA[0].line_one, HAIKU_DATA[0].line_two, HAIKU_DATA[0].line_three)
                await hnft.mintHaiku(HAIKU_DATA[1].line_one, HAIKU_DATA[1].line_two, HAIKU_DATA[1].line_three)

                await hnft.shareHaiku(address, 1)
                let sharedHaikus = await hnft.connect(otherAccount).getMySharedHaikus()

                expect(sharedHaikus[0][0]).to.eq(addressOwner)
                expect(sharedHaikus[0][1]).to.eq(HAIKU_DATA[0].line_one)
                expect(sharedHaikus[0][2]).to.eq(HAIKU_DATA[0].line_two)
                expect(sharedHaikus[0][3]).to.eq(HAIKU_DATA[0].line_three)
                await hnft.shareHaiku(address, 2)
                sharedHaikus = await hnft.connect(otherAccount).getMySharedHaikus()
                console.log(sharedHaikus)
                sharedHaikus.map((haiku, index) => {
                    expect(haiku[0]).to.eq(addressOwner)
                    expect(haiku[1]).to.eq(HAIKU_DATA[index].line_one)
                    expect(haiku[2]).to.eq(HAIKU_DATA[index].line_two)
                    expect(haiku[3]).to.eq(HAIKU_DATA[index].line_three)
                })
                
            })

            it("reverts on if haiku isn't author by caller", async () => {
                const { hnft, HAIKU_DATA, owner, otherAccount } = await loadFixture(deployHaikuNFTContract);
                const address = await owner.getAddress()

                await hnft.connect(otherAccount).mintHaiku(HAIKU_DATA[0].line_one, HAIKU_DATA[0].line_two, HAIKU_DATA[0].line_three)
                await hnft.connect(otherAccount).mintHaiku(HAIKU_DATA[1].line_one, HAIKU_DATA[1].line_two, HAIKU_DATA[1].line_three)
                await expect(hnft.shareHaiku(address, 1)).to.be.revertedWithCustomError(hnft, "NotYourHaiku")
                .withArgs(1)
                await expect(hnft.shareHaiku(address, 2)).to.be.revertedWithCustomError(hnft, "NotYourHaiku")
                .withArgs(2)
            })
            it("reverts with NoHaikusShared if no haikus have been shared with caller getMySharedHaikus()", async () => {
                const { hnft, HAIKU_DATA, owner, otherAccount } = await loadFixture(deployHaikuNFTContract);
                const address = await owner.getAddress()

                await hnft.connect(otherAccount).mintHaiku(HAIKU_DATA[0].line_one, HAIKU_DATA[0].line_two, HAIKU_DATA[0].line_three)
                await hnft.connect(otherAccount).mintHaiku(HAIKU_DATA[1].line_one, HAIKU_DATA[1].line_two, HAIKU_DATA[1].line_three)
                await expect(hnft.getMySharedHaikus()).to.be.revertedWithCustomError(hnft, "NoHaikusShared")

            })
        })

    })
});
