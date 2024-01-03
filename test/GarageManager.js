const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  describe("GarageManager", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    deployGarageManagerContract = async () => {
      // Contracts are deployed using the first signer/account by default
      const [ owner, otherAccount, acctTwo, acctThree ] = await ethers.getSigners();
      let CAR_DATA = require("../data/car_data.json")
      const GarageManager = await ethers.getContractFactory("GarageManager");
      const gman = await GarageManager.deploy()
      return { gman, CAR_DATA, owner, otherAccount, acctTwo, acctThree };
    }
    describe("Deployment", async () => {
      it("Doesn't deploy to Address(0)", async () => {
        const { gman } = await loadFixture(deployGarageManagerContract);
        expect(gman.target).to.not.eq(0x0000000000000000000000000000000000000000)
      })
    })
    describe('users and cars',async () => {
        it("allows users to add cars", async () => {
            const { gman, CAR_DATA, owner, otherAccount } = await loadFixture(deployGarageManagerContract);
            await gman.connect(owner).addCar(CAR_DATA[0].make, CAR_DATA[0].model, CAR_DATA[0].color, CAR_DATA[0].number_of_doors)
            await gman.connect(owner).addCar(CAR_DATA[1].make, CAR_DATA[1].model, CAR_DATA[1].color, CAR_DATA[1].number_of_doors)
            await gman.connect(otherAccount).addCar(CAR_DATA[2].make, CAR_DATA[2].model, CAR_DATA[2].color, CAR_DATA[2].number_of_doors)
            await gman.connect(otherAccount).addCar(CAR_DATA[3].make, CAR_DATA[3].model, CAR_DATA[3].color, CAR_DATA[3].number_of_doors)

            let owner_garage = await gman.connect(owner).getMyCars()
            let other_garage = await gman.connect(otherAccount).getMyCars()

            owner_garage.forEach((car, index) => {
              expect(car[0]).to.eq(CAR_DATA[index].make)
              expect(car[1]).to.eq(CAR_DATA[index].model)
              expect(car[2]).to.eq(CAR_DATA[index].color)
              expect(car[3]).to.eq(CAR_DATA[index].number_of_doors)
            });
            other_garage.forEach((car, index) => {
              expect(car[0]).to.eq(CAR_DATA[index + 2].make)
              expect(car[1]).to.eq(CAR_DATA[index + 2].model)
              expect(car[2]).to.eq(CAR_DATA[index + 2].color)
              expect(car[3]).to.eq(CAR_DATA[index + 2].number_of_doors)
            })
        })
        it("allows user to update a car", async () => {
          const { gman, CAR_DATA, owner, otherAccount } = await loadFixture(deployGarageManagerContract);
          const UPDATE_INDEX = 1
          let new_car =     {
            "make": "TACO", 
            "model": "GOOD",
            "color": "YELLOW",
            "number_of_doors": 100
        }
        let NEW_CAR_DATA = []
        for(let i = 0; i < CAR_DATA.length; i++) {
            if(i != UPDATE_INDEX) NEW_CAR_DATA.push(CAR_DATA[i])
            else NEW_CAR_DATA.push(new_car)
        }
          for(let i = 0; i < CAR_DATA.length; i++) {
            await gman.connect(owner).addCar(CAR_DATA[i].make, CAR_DATA[i].model, CAR_DATA[i].color, CAR_DATA[i].number_of_doors)
          }

          let owner_garage = await gman.connect(owner).getMyCars()

          expect(owner_garage.length).to.eq(CAR_DATA.length)

          owner_garage.forEach((car, index) => {
            expect(car[0]).to.eq(CAR_DATA[index].make)
            expect(car[1]).to.eq(CAR_DATA[index].model)
            expect(car[2]).to.eq(CAR_DATA[index].color)
            expect(car[3]).to.eq(CAR_DATA[index].number_of_doors)
          })          
          await gman.connect(owner).updateCar(UPDATE_INDEX, new_car.make, new_car.model, new_car.color, new_car.number_of_doors)
          owner_garage = await gman.connect(owner).getMyCars()
          owner_garage.forEach((car, index) => {
            expect(car[0]).to.eq(NEW_CAR_DATA[index].make)
            expect(car[1]).to.eq(NEW_CAR_DATA[index].model)
            expect(car[2]).to.eq(NEW_CAR_DATA[index].color)
            expect(car[3]).to.eq(NEW_CAR_DATA[index].number_of_doors)
          })    
        })

        it("allows user to update a car", async () => {
          const { gman, CAR_DATA, owner, otherAccount } = await loadFixture(deployGarageManagerContract);
          const UPDATE_INDEX = 10
          let new_car =     {
            "make": "TACO", 
            "model": "GOOD",
            "color": "YELLOW",
            "number_of_doors": 100
        }

          for(let i = 0; i < CAR_DATA.length; i++) {
            await gman.connect(owner).addCar(CAR_DATA[i].make, CAR_DATA[i].model, CAR_DATA[i].color, CAR_DATA[i].number_of_doors)
          }

          let owner_garage = await gman.connect(owner).getMyCars()

          expect(owner_garage.length).to.eq(CAR_DATA.length)

          owner_garage.forEach((car, index) => {
            expect(car[0]).to.eq(CAR_DATA[index].make)
            expect(car[1]).to.eq(CAR_DATA[index].model)
            expect(car[2]).to.eq(CAR_DATA[index].color)
            expect(car[3]).to.eq(CAR_DATA[index].number_of_doors)
          })          
          await expect(gman.connect(owner).updateCar(
            UPDATE_INDEX, new_car.make, new_car.model, new_car.color, new_car.number_of_doors
            )).to.be.revertedWithCustomError(gman, "BadCarIndex")
            .withArgs(UPDATE_INDEX)
        })
        it("properly removes one car from garage", async () => {
          const { gman, CAR_DATA, owner, otherAccount } = await loadFixture(deployGarageManagerContract);
          const DELETE_INDEX = 1
          for(let i = 0; i < CAR_DATA.length; i++) {
            await gman.connect(owner).addCar(CAR_DATA[i].make, CAR_DATA[i].model, CAR_DATA[i].color, CAR_DATA[i].number_of_doors)
          }

          let owner_garage = await gman.connect(owner).getMyCars()
          expect(owner_garage.length).to.eq(CAR_DATA.length)
          
          await gman.connect(owner).deleteOneCarFromMyGarage(DELETE_INDEX)
  
          owner_garage = await gman.connect(owner).getMyCars()

          expect(owner_garage.length).to.eq(CAR_DATA.length - 1)

          owner_garage.forEach((car, index) => {
            if (index >= DELETE_INDEX) {
              expect(car[0]).to.eq(CAR_DATA[index + 1].make)
              expect(car[1]).to.eq(CAR_DATA[index + 1].model)
              expect(car[2]).to.eq(CAR_DATA[index + 1].color)
              expect(car[3]).to.eq(CAR_DATA[index + 1].number_of_doors)
            } else  {
              expect(car[0]).to.eq(CAR_DATA[index].make)
              expect(car[1]).to.eq(CAR_DATA[index].model)
              expect(car[2]).to.eq(CAR_DATA[index].color)
              expect(car[3]).to.eq(CAR_DATA[index].number_of_doors)
            }
          })
    
      })

      it("reverts on deleteOneCarFromMyGarage if index is out of range", async () => {
        const { gman, CAR_DATA, owner } = await loadFixture(deployGarageManagerContract);
        const DELETE_INDEX = CAR_DATA.length
        for(let i = 0; i < CAR_DATA.length; i++) {
          await gman.connect(owner).addCar(CAR_DATA[i].make, CAR_DATA[i].model, CAR_DATA[i].color, CAR_DATA[i].number_of_doors)
        }

        let owner_garage = await gman.connect(owner).getMyCars()
        expect(owner_garage.length).to.eq(CAR_DATA.length)
        
        await expect(gman.connect(owner).deleteOneCarFromMyGarage(DELETE_INDEX)).to.be.revertedWithCustomError(gman, "BadCarIndex")
        .withArgs(DELETE_INDEX)
  
    })
        it("properly resets garage", async () => {
          const { gman, CAR_DATA, owner, otherAccount } = await loadFixture(deployGarageManagerContract);
          await gman.connect(owner).addCar(CAR_DATA[0].make, CAR_DATA[0].model, CAR_DATA[0].color, CAR_DATA[0].number_of_doors)
          await gman.connect(owner).addCar(CAR_DATA[1].make, CAR_DATA[1].model, CAR_DATA[1].color, CAR_DATA[1].number_of_doors)
          await gman.connect(otherAccount).addCar(CAR_DATA[2].make, CAR_DATA[2].model, CAR_DATA[2].color, CAR_DATA[2].number_of_doors)
          await gman.connect(otherAccount).addCar(CAR_DATA[3].make, CAR_DATA[3].model, CAR_DATA[3].color, CAR_DATA[3].number_of_doors)

          await gman.connect(owner).resetMyGarage()
          await gman.connect(otherAccount).resetMyGarage()

          let owner_garage = await gman.connect(owner).getMyCars()
          let other_garage = await gman.connect(otherAccount).getMyCars()

          expect(owner_garage.length).to.eq(0)
          expect(other_garage.length).to.eq(0)

      })
    })
});
