const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  describe("ImportsExercise", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    deployImportsExerciseContract = async () => {
  
      // Contracts are deployed using the first signer/account by default
      const [ owner, otherAccount, acctTwo, acctThree ] = await ethers.getSigners();
      const ImportsExercise = await ethers.getContractFactory("ImportsExercise");
      const ie = await ImportsExercise.deploy();

      let stringOne = "a smart contract deployed on Base"
      let stringTwo = "sitting silently away in the misty ether"
      let stringThree = "patiently waiting, awaiting his call"
  
      return { ie, owner, otherAccount, acctTwo, acctThree, stringOne, stringTwo, stringThree };
    }
    describe("Deployment", async () => {
      it("Haiku should initailize to default values", async () => {
        const { ie } = await loadFixture(deployImportsExerciseContract);
        const haiku = await ie.getHaiku()
        
        expect(haiku[0]).to.equal('');
        expect(haiku[1]).to.equal('');
        expect(haiku[2]).to.equal('');
      })
    })
    describe('function saveHaiku()',async () => {
      it('should allow any caller to saveHaiku', async () => {
        const { ie, acctThree, stringOne, stringTwo, stringThree } = await loadFixture(deployImportsExerciseContract);

        await ie.connect(acctThree).saveHaiku(stringOne, stringTwo, stringThree)

        const haiku = await ie.getHaiku()
        
        expect(haiku[0]).to.equal(stringOne);
        expect(haiku[1]).to.equal(stringTwo);
        expect(haiku[2]).to.equal(stringThree);
      })
      it("function shruggieHaiku()", async () => {
        const { ie, acctTwo, stringOne, stringTwo, stringThree } = await loadFixture(deployImportsExerciseContract);

        await ie.connect(acctTwo).saveHaiku(stringOne, stringTwo, stringThree)

        const haiku = await ie.getHaiku()
        
        expect(haiku[0]).to.equal(stringOne);
        expect(haiku[1]).to.equal(stringTwo);
        expect(haiku[2]).to.equal(stringThree);

        const shruggieHaiku = await ie.shruggieHaiku()
        expect(shruggieHaiku[0]).to.equal(stringOne);
        expect(shruggieHaiku[1]).to.equal(stringTwo);
        expect(shruggieHaiku[2]).to.equal('patiently waiting, awaiting his call 🤷');

        console.log(shruggieHaiku)
      })
    })
  });
  