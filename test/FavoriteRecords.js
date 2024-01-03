const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  describe("FavoriteRecords", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    deployFavoriteRecordsContract = async () => {
      // Contracts are deployed using the first signer/account by default
      const [ owner, otherAccount, acctTwo, acctThree ] = await ethers.getSigners();

      const FavoriteRecords = await ethers.getContractFactory("FavoriteRecords");
      const INIT_RECORDS = [
        "Thriller","Back in Black","The Bodyguard","The Dark Side of the Moon",
        "Their Greatest Hits (1971-1975)","Hotel California","Come On Over",
        "Rumours","Saturday Night Fever"]
        let NEW_RECORDS = [
            "Neon Bible", "The Suffer and the Witness", "They're Only Chasing Safety"
          ]
      const fr = await FavoriteRecords.deploy()
      return { fr, INIT_RECORDS, NEW_RECORDS, owner, otherAccount, acctTwo, acctThree };
    }
    describe("Deployment", async () => {
      it("Doesn't deploy to Address(0)", async () => {
        const { fr } = await loadFixture(deployFavoriteRecordsContract);
        expect(fr.target).to.not.eq(0x0000000000000000000000000000000000000000)
      })
      it("initializes record array to approved records", async () => {
        const { fr, INIT_RECORDS } = await loadFixture(deployFavoriteRecordsContract);
        let approved_records = await fr.getApprovedRecords()
        approved_records.forEach((rec, index) => {
            expect(rec).to.eq(INIT_RECORDS[index])
        })
      })
      it("has the correct admin set on deployment", async () => {
        const { fr, owner } = await loadFixture(deployFavoriteRecordsContract);
        let admin = await fr.admin()
        let ownerAddress = await owner.getAddress()
        expect(admin).to.eq(ownerAddress)
      })
    })
    describe('setApprovedRecordsArray',async () => {
        it("allows admin to add approved records", async () => {
          const { fr, INIT_RECORDS, NEW_RECORDS, owner, otherAccount } = await loadFixture(deployFavoriteRecordsContract);

          await fr.setApprovedRecordsArray(NEW_RECORDS)

          let new_approved = await fr.getApprovedRecords()

          new_approved.forEach((rec, index) => {
            if(index >= INIT_RECORDS.length) {
                let new_index = index - INIT_RECORDS.length
                expect(rec).to.eq(NEW_RECORDS[new_index])
            } else expect(rec).to.eq(INIT_RECORDS[index])
          })


        })
        it("reverts when caller is not admin", async () => {
          const { fr, NEW_RECORDS, otherAccount } = await loadFixture(deployFavoriteRecordsContract);
          await expect(fr.connect(otherAccount).setApprovedRecordsArray(NEW_RECORDS)).to.be.revertedWith("SENDER NOT ADMIN")
        })
    })
    describe('caller adding records to favoriteRecords',async () => {
        it("it allows caller to add approved record", async () => {
          const { fr, NEW_RECORDS, otherAccount } = await loadFixture(deployFavoriteRecordsContract);
          await fr.setApprovedRecordsArray(NEW_RECORDS)
          await fr.connect(otherAccount).addRecord(NEW_RECORDS[0])
        })
        it("returns array of correct favoritest to true)", async () => {
            const { fr, NEW_RECORDS, otherAccount } = await loadFixture(deployFavoriteRecordsContract);
            await fr.setApprovedRecordsArray(NEW_RECORDS)
            for(let i = 0; i < NEW_RECORDS.length; i++) {
                await fr.connect(otherAccount).addRecord(NEW_RECORDS[i])
            }
            let address = await otherAccount.getAddress()
            let user_favs = await fr.getUserFavorites(address)
            user_favs.forEach((rec, index) => {
                expect(rec).to.eq(NEW_RECORDS[index])
            })
        })
        it("ensures non added records aren't favorited (set to true)", async () => {
            const { fr, INIT_RECORDS, NEW_RECORDS, otherAccount } = await loadFixture(deployFavoriteRecordsContract);
            await fr.setApprovedRecordsArray(NEW_RECORDS)
            let address = await otherAccount.getAddress()

            for(let i = 0; i < NEW_RECORDS.length; i++) {
                await fr.connect(otherAccount).addRecord(NEW_RECORDS[i])
            }
            for(let i = 0; i < INIT_RECORDS.length; i++) {
                let fav = await fr.userFavorites(address, INIT_RECORDS[i])
                expect(fav).to.eq(false)
            }
            for(let i = 0; i < NEW_RECORDS.length; i++) {
                let fav = await fr.userFavorites(address, NEW_RECORDS[i])
                expect(fav).to.eq(true)
            }
        })
        it("reverts if records isn't approved", async () => {
            const { fr, INIT_RECORDS, NEW_RECORDS, otherAccount } = await loadFixture(deployFavoriteRecordsContract);

            for(let i = 0; i < NEW_RECORDS.length; i++) {
                await expect(fr.connect(otherAccount).addRecord(NEW_RECORDS[i])).to.be.revertedWithCustomError(fr, "NotApproved")
                .withArgs(NEW_RECORDS[i])
            }
        })

        it("correctly resets the user's favorites (sets all to false)", async () => {
            const { fr, INIT_RECORDS, NEW_RECORDS, otherAccount } = await loadFixture(deployFavoriteRecordsContract);
            await fr.setApprovedRecordsArray(NEW_RECORDS)
            let address = await otherAccount.getAddress()

            for(let i = 0; i < NEW_RECORDS.length; i++) {
                await fr.connect(otherAccount).addRecord(NEW_RECORDS[i])
            }
            for(let i = 0; i < INIT_RECORDS.length; i++) {
                let fav = await fr.userFavorites(address, INIT_RECORDS[i])
                expect(fav).to.eq(false)
            }
            for(let i = 0; i < NEW_RECORDS.length; i++) {
                let fav = await fr.userFavorites(address, NEW_RECORDS[i])
                expect(fav).to.eq(true)
            }

            await fr.connect(otherAccount).resetUserFavorites()

            for(let i = 0; i < NEW_RECORDS.length; i++) {
                let fav = await fr.userFavorites(address, NEW_RECORDS[i])
                expect(fav).to.eq(false)
            }
        })
    })
});
