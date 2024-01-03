const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  describe("EmployeeStorage", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    deployEmployeeStorageContract = async () => {
  
      // Contracts are deployed using the first signer/account by default
      const [ owner, otherAccount, acctTwo, acctThree ] = await ethers.getSigners();
      const SHARES = 1000;
      const SALARY = 250000;
      const ID_NUMBER = 12345;
      const NAME = "PACO";
      const EmployeeStorage = await ethers.getContractFactory("EmployeeStorage");
      const es = await EmployeeStorage.deploy(SHARES, SALARY, ID_NUMBER, NAME)
      return { es, SHARES, SALARY, ID_NUMBER, NAME, owner, otherAccount, acctTwo, acctThree };
    }
    describe("Deployment", async () => {
      it("Doesn't deploy to Address(0)", async () => {
        const { es } = await loadFixture(deployEmployeeStorageContract);
        expect(es.target).to.not.eq(0x0000000000000000000000000000000000000000)
      })
      it("Initializes the correct variables", async () => {
        const { es, SHARES, SALARY, ID_NUMBER, NAME } = await loadFixture(deployEmployeeStorageContract);
        let _shares = await es.viewShares()
        let _salary = await es.viewSalary()
        let _id_number = await es.idNumber()
        let _name = await es.name()
        
        expect(_shares).to.eq(SHARES)
        expect(_salary).to.eq(SALARY)
        expect(_id_number).to.eq(ID_NUMBER)
        expect(_name).to.eq(NAME)
      })
    })
    describe('function grantNewShares()',async () => {
        it("allows shares to be added if total shares < 5000", async () => {
          const { es, SHARES } = await loadFixture(deployEmployeeStorageContract);
          let add_shares = 2500

          await es.grantShares(add_shares)
          
          let new_shares = await es.viewShares()

          expect(SHARES + add_shares).to.eq(new_shares)
        })
        it("should revert with custom error if total shares > 5000", async () => {
          const { es, SHARES } = await loadFixture(deployEmployeeStorageContract);
          let add_shares = 5000

          await expect(es.grantShares(add_shares)).to.revertedWithCustomError(es, "TooManyShares")
          .withArgs(add_shares + SHARES)
        })
        it("allows debugReset to reset shares to 1000", async () => {
          const { es, SHARES } = await loadFixture(deployEmployeeStorageContract);
          let add_shares = 2500

          await es.grantShares(add_shares)
          
          let new_shares = await es.viewShares()

          expect(SHARES + add_shares).to.eq(new_shares)

          await es.debugResetShares()

          new_shares = await es.viewShares()

          expect(new_shares).to.eq(SHARES)

        })
    })
    describe('variable packing',async () => {
        it("check for packed variabls", async () => {
          const { es, ID_NUMBER } = await loadFixture(deployEmployeeStorageContract);
          let id_number = await es.checkForPacking(1)
          expect(id_number).to.eq(ID_NUMBER)
        })
    })
});
