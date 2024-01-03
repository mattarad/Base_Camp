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
    deployControlStructuresContract = async () => {
  
      // Contracts are deployed using the first signer/account by default
      const AMOUNT_TO_TEST = 25
      const [ owner, otherAccount, acctTwo, acctThree ] = await ethers.getSigners();
      const ControlStructures = await ethers.getContractFactory("ControlStructures");
      const cs = await ControlStructures.deploy()

      let numbers = []
      let string_response = []
      for(let i = 0; i < AMOUNT_TO_TEST; i++) {
        let num = Math.floor(Math.random() * 1000)
        numbers.push(num)
        if (num % 3 == 0 && num % 5 == 0) string_response.push("FizzBuzz");
        else if (num % 3 == 0) string_response.push("Fizz");
        else if (num % 5 == 0) string_response.push("Buzz");
        else string_response.push("Splat");
      }

      return { cs, numbers, string_response, owner, otherAccount, acctTwo, acctThree };
    }
    describe("Deployment", async () => {
      it("Doesn't deploy to Address(0)", async () => {
        const { cs, numbers, string_response } = await loadFixture(deployControlStructuresContract);
        expect(cs.target).to.not.eq(0x0000000000000000000000000000000000000000)
      })
    })
    describe('function fizzBuzz',async () => {
        it("checks the result of all fizzbuzz calls", async () => {
            const { cs, numbers, string_response } = await loadFixture(deployControlStructuresContract);
            let string_results = []
            for(let i = 0; i < numbers.length; i++) {
                let res = await cs.fizzBuzz(numbers[i])
                console.log(res)
                console.log(string_response[i])
                console.log('------------------')
                string_results.push(res)
            }
            string_response.forEach((res, index) => {
                expect(string_results[index]).to.eq(res)
            });
        })
    })
    // if (_time >= 1200 && _time <= 1259) revert("At Lunch!");
    // else if (_time >= 800 && _time <= 1199) return "Morning!";
    // else if (_time >= 1300 && _time <= 1799) return "Afternoon!";
    // else if (_time >= 1800 && _time <= 2200) return "Evening!";
    // else revert AfterHours(_time);

    describe('function doNotDisturb',async () => {
        it("reverts with At Lunch!", async () => {
            const { cs } = await loadFixture(deployControlStructuresContract);

            let input = 1235
            await expect(cs.doNotDisturb(input)).to.be.revertedWith("At Lunch!")
        })
        it("returns: Morning!", async () => {
            const { cs } = await loadFixture(deployControlStructuresContract);

            let input = 930
            let result = await cs.doNotDisturb(input)
            expect(result).to.eq("Morning!")
        })
        it("returns: Afternoon!", async () => {
            const { cs } = await loadFixture(deployControlStructuresContract);

            let input = 1500
            let result = await cs.doNotDisturb(input)
            expect(result).to.eq("Afternoon!")
        })
        it("returns: Evening!", async () => {
            const { cs } = await loadFixture(deployControlStructuresContract);

            let input = 2100
            let result = await cs.doNotDisturb(input)
            expect(result).to.eq("Evening!")
        })
        it("reverts with AfterHours(_time)", async () => {
            const { cs } = await loadFixture(deployControlStructuresContract);

            let input = 2300
            await expect(cs.doNotDisturb(input)).to.be.revertedWithCustomError(cs, "AfterHours")
            .withArgs(input)
        })
        it("fails to pass assert(_time < 2400)", async () => {
            const { cs } = await loadFixture(deployControlStructuresContract);

            let input = 2500
            await expect(cs.doNotDisturb(input)).to.be.revertedWithPanic()
        })
    })
});
