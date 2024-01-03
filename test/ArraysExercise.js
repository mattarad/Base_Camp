const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  describe("ArraysExercise", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    deployArraysExerciseContract = async () => {
  
      // Contracts are deployed using the first signer/account by default
      const [ owner, otherAccount, acctTwo, acctThree, acctFour, acctFive, acctSix, acctSeven ] = await ethers.getSigners();
      const ArraysExercise = await ethers.getContractFactory("ArraysExercise");
      const ae = await ArraysExercise.deploy()
      numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      let user_data = require('../data/user_data.json')
      let signers = [ owner, otherAccount, acctTwo, acctThree, acctFour, acctFive, acctSix, acctSeven ]

      return { ae, numbers, user_data, signers, owner, otherAccount, acctTwo, acctThree };
    }
    describe("Deployment", async () => {
      it("Doesn't deploy to Address(0)", async () => {
        const { ae, owner, otherAccount, acctTwo, acctThree } = await loadFixture(deployArraysExerciseContract);
        expect(ae.target).to.not.eq(0x0000000000000000000000000000000000000000)
      })
    })
    describe('numbers array',async () => {
        it("starts with array of 1 - 10", async () => {
        const { ae, numbers, owner, otherAccount, acctTwo, acctThree } = await loadFixture(deployArraysExerciseContract);
            let nums = await ae.getNumbers()
            nums.forEach((num, index) => {
                expect(num).to.eq(numbers[index])
            });
        })
        it("appends to the array through appendToNumbers()", async () => {
            const { ae, numbers, owner, otherAccount, acctTwo, acctThree } = await loadFixture(deployArraysExerciseContract);
            let nums_append = [11,12,13,14,15]
            let new_numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
            nums_append.forEach(num => {
                new_numbers.push(num)
            })
            await ae.connect(acctThree).appendToNumbers(nums_append)
            let nums = await ae.getNumbers()
            nums.forEach((num, index) => {
                expect(num).to.eq(new_numbers[index])
            });
            console.log(numbers)

        })
        it("resets the numbers to the default numbers array 1 - 10", async () => {
            const { ae, numbers, owner, otherAccount, acctTwo, acctThree } = await loadFixture(deployArraysExerciseContract);
            
            // changing the original array of 1 -10
            let nums_append = [11,12,13,14,15]
            let new_numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
            nums_append.forEach(num => {
                new_numbers.push(num)
            })
            await ae.connect(acctThree).appendToNumbers(nums_append)
            let nums = await ae.getNumbers()
            //testing to make sure the array was changed
            expect(nums.length).to.eq(new_numbers.length)

            nums.forEach((num, index) => {
                expect(num).to.eq(new_numbers[index])
            });
            //reseting array
            await ae.connect(acctTwo).resetNumbers()
            let new_nums = await ae.getNumbers()
            // tests array to ensure success reset back to 1-10
            new_nums.forEach((num, index) => {
                expect(num).to.eq(numbers[index])
            });
            expect(new_nums.length).to.eq(numbers.length)
        })
    })
    describe('afterY2K',async () => {
        it("saves timestamps for caller", async () => {
            const { ae, signers, user_data } = await loadFixture(deployArraysExerciseContract);

            for(let i=0; i < signers.length; i++) {
                await ae.connect(signers[i]).saveTimestamp(user_data[i].timestamp)
            }

            for(let i=0; i < signers.length; i++) {
                let address = await signers[i].getAddress()
                let sender = await ae.senders(i)
                let timestamp = await ae.timestamps(i)

                expect(timestamp).to.eq(user_data[i].timestamp)
                expect(sender).to.eq(address)
            }
        })
        it("function afterY2K() returns timestamps after y2k", async () => {
            const { ae, signers, user_data } = await loadFixture(deployArraysExerciseContract);
            let addresses = []

            for(let i=0; i < signers.length; i++) {
                await ae.connect(signers[i]).saveTimestamp(user_data[i].timestamp)
                let address = await signers[i].getAddress()
                addresses.push(address)
            }

            let after_y2k = await ae.afterY2K()
            let count = 0
            user_data.forEach((user, index) => {
                if(user.after_y2k){
                    expect(after_y2k[0][count]).to.eq(user.timestamp)
                    expect(after_y2k[1][count]).to.eq(addresses[index])
                    count++
                }
            })
        })
        it("allows users to reset the arrays", async () => {
            const { ae, signers, user_data } = await loadFixture(deployArraysExerciseContract);

            for(let i=0; i < signers.length; i++) {
                await ae.connect(signers[i]).saveTimestamp(user_data[i].timestamp)
            }
            let senders_length = await ae.getSendersLength()
            let time_length = await ae.getTimestampsLength()

            await ae.resetSenders()
            await ae.resetTimestamps()

            let new_senders_length = await ae.getSendersLength()
            let new_time_length = await ae.getTimestampsLength()

            expect(senders_length).to.eq(signers.length)
            expect(time_length).to.eq(signers.length)

            expect(new_senders_length).to.eq(0)
            expect(new_time_length).to.eq(0)
        })
        it("resetTimestampsAndSenders() reverts if senders array was reset.", async () => {
            const { ae, signers, user_data } = await loadFixture(deployArraysExerciseContract);
            for(let i=0; i < signers.length; i++) {
                await ae.connect(signers[i]).saveTimestamp(user_data[i].timestamp)
            }

            await ae.resetSenders()

            await expect(ae.resetTimestampsAndSenders()).to.be.revertedWith("Array lengths do not match, reset using individual funcs.")
        })
        it("resetTimestampsAndSenders() reverts if timestamps array was reset.", async () => {
            const { ae, signers, user_data } = await loadFixture(deployArraysExerciseContract);
            for(let i=0; i < signers.length; i++) {
                await ae.connect(signers[i]).saveTimestamp(user_data[i].timestamp)
            }

            await ae.resetTimestamps()

            await expect(ae.resetTimestampsAndSenders()).to.be.revertedWith("Array lengths do not match, reset using individual funcs.")
        })
        it("resetTimestampsAndSenders() correctly resets arrays if arrays.length match", async () => {
            const { ae, signers, user_data } = await loadFixture(deployArraysExerciseContract);
            for(let i=0; i < signers.length; i++) {
                await ae.connect(signers[i]).saveTimestamp(user_data[i].timestamp)
            }

            let senders_length = await ae.getSendersLength()
            let time_length = await ae.getTimestampsLength()

            await ae.resetTimestampsAndSenders()

            let new_senders_length = await ae.getSendersLength()
            let new_time_length = await ae.getTimestampsLength()

            expect(senders_length).to.eq(signers.length)
            expect(time_length).to.eq(signers.length)

            expect(new_senders_length).to.eq(0)
            expect(new_time_length).to.eq(0)

        })
    })
});
