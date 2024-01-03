const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  describe("ErrorTriageExercise", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    deployErrorTriageExerciseContract = async () => {
  
      // Contracts are deployed using the first signer/account by default
      const [ owner, otherAccount, acctTwo, acctThree ] = await ethers.getSigners();

      const ErrorTriageExercise = await ethers.getContractFactory("ErrorTriageExercise");
      const etc = await ErrorTriageExercise.deploy()
      let NUMBERS = [Math.floor(Math.random() * 1000), Math.floor(Math.random() * 1000), Math.floor(Math.random() * 1000), Math.floor(Math.random() * 1000)]
      return { etc, NUMBERS, owner, otherAccount, acctTwo, acctThree };
    }
    diffWithNeighbor = (_a, _b, _c, _d) => {
        let res = [0,0,0]
        res[0] = _a > _b ? _a - _b : _b - _a;
        res[1] = _b > _c ? _b - _c : _c - _b;
        res[2] = _c > _d ? _c - _d : _d - _c;
        return res
    }
    describe("Deployment", async () => {
      it("Doesn't deploy to Address(0)", async () => {
        const { etc } = await loadFixture(deployErrorTriageExerciseContract);
        expect(etc.target).to.not.eq(0x0000000000000000000000000000000000000000)
      })
    })
    describe('diffWithNeighbor',async () => {
        it("returns correct values from diffWithNeighbor", async () => {
          const { etc, NUMBERS } = await loadFixture(deployErrorTriageExerciseContract);
          let contract_numbers = await etc.diffWithNeighbor(NUMBERS[0],NUMBERS[1],NUMBERS[2],NUMBERS[3])
          let numbers_js_function = diffWithNeighbor(NUMBERS[0],NUMBERS[1],NUMBERS[2],NUMBERS[3])
          numbers_js_function.forEach((num, index) => {
            expect(num).to.eq(contract_numbers[index])
          });

        })
        it("returns correct value applyModifier", async () => {
            const { etc } = await loadFixture(deployErrorTriageExerciseContract);
            let BASE = 5000
            let MOD = -50
            let contract_result = await etc.applyModifier(BASE, MOD)
            let base_mod = BASE +  MOD
            expect(contract_result).to.eq(base_mod)

            BASE = 1000
            MOD = 99
            contract_result = await etc.applyModifier(BASE, MOD)
            base_mod = BASE +  MOD
            expect(contract_result).to.eq(base_mod)
  
          })
    })
    describe('array functions',async () => {
        it("reverts if arr.length = 0 on popWithReturn()", async () => {
            const { etc } = await loadFixture(deployErrorTriageExerciseContract);
            // arr is initialized to empty array
            await expect(etc.popWithReturn()).to.be.revertedWithCustomError(etc, "ArrayLengthZero")
          })
          it("correctly deletes the array", async () => {
            const { etc, NUMBERS } = await loadFixture(deployErrorTriageExerciseContract);
            for(let i = 0; i < NUMBERS.length; i++) {
                await etc.addToArr(NUMBERS[i])
            }

            let arr = await etc.getArr()
            expect(arr.length).to.eq(NUMBERS.length)

            await etc.resetArr()
            arr = await etc.getArr()

            expect(arr.length).to.eq(0)
          })
          it("correctly adds a number to arr", async () => {
            const { etc, NUMBERS } = await loadFixture(deployErrorTriageExerciseContract);
            for(let i = 0; i < NUMBERS.length; i++) {
                await etc.addToArr(NUMBERS[i])
            }

            let arr = await etc.getArr()

            arr.forEach((num, index) => {
                expect(num).to.eq(NUMBERS[index])
            })
          })
          it("correctly pops and returns last array element ", async () => {
            const { etc, NUMBERS } = await loadFixture(deployErrorTriageExerciseContract);
            for(let i = 0; i < NUMBERS.length; i++) {
                await etc.addToArr(NUMBERS[i])
            }

            let arr = await etc.getArr()

            arr.forEach((num, index) => {
                expect(num).to.eq(NUMBERS[index])
            })

            let num = await etc.popWithReturn()
            arr = await etc.getArr()

            expect(arr.length).to.eq(NUMBERS.length - 1)
            num = await etc.popWithReturn()
            arr = await etc.getArr()

            expect(arr.length).to.eq(NUMBERS.length - 2)
          })
    })
});
