const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  describe("BasicMath", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    deployBasicMathContract = async () => {
  
      // Contracts are deployed using the first signer/account by default
      const [ owner, otherAccount, acctTwo, acctThree ] = await ethers.getSigners();
      const BasicMath = await ethers.getContractFactory("BasicMath");
      const bm = await BasicMath.deploy()
      return { bm, owner, otherAccount, acctTwo, acctThree };
    }
    describe("Deployment", async () => {
      it("Doesn't deploy to Address(0)", async () => {
        const { bm, owner, otherAccount, acctTwo, acctThree } = await loadFixture(deployBasicMathContract);
        expect(bm.target).to.not.eq(0x0000000000000000000000000000000000000000)
        //
      })
    })
    describe('function adder',async () => {
        it("adder(5, 10) / no overflow expected", async () => {
            const { bm, owner } = await loadFixture(deployBasicMathContract);
            let result = await bm.adder(5, 10)
            expect(result[0]).to.equal(15)
            expect(result[1]).to.equal(false)
        })
        it("adder(5, MAXINT) / overflow expected", async () => {
            const { bm, owner, otherAccount, acctTwo, acctThree } = await loadFixture(deployBasicMathContract);
            let result = await bm.adder(5, "115792089237316195423570985008687907853269984665640564039457584007913129639935")
            expect(result[0]).to.equal(0)
            expect(result[1]).to.equal(true)
        })
    })
    describe('function subtractor',async () => {
        it("subtractor(10, 5) / no overflow expected", async () => {
            const { bm, owner } = await loadFixture(deployBasicMathContract);
            let result = await bm.subtractor(10, 5)
            expect(result[0]).to.equal(5)
            expect(result[1]).to.equal(false)
            115792089237316195423570985008687907853269984665640564039457584007913129639935

        })
        it("subtractor(5, MAXINT) / overflow expected", async () => {
            const { bm, owner, otherAccount, acctTwo, acctThree } = await loadFixture(deployBasicMathContract);
            let result = await bm.subtractor(5, 10)
            expect(result[0]).to.equal(0)
            expect(result[1]).to.equal(true)
        })
    })
});
