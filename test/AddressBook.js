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
    deployAddressBookContract = async () => {
  
      // Contracts are deployed using the first signer/account by default
      const [ owner, otherAccount, acctTwo, acctThree ] = await ethers.getSigners();
      const AddressBook = await ethers.getContractFactory("AddressBook");
      return { AddressBook, owner, otherAccount, acctTwo, acctThree };
    }
    describe("Deployment", async () => {
      it("Anyone should be able to deploy AddressBook contract", async () => {
        const { AddressBook, owner, otherAccount, acctTwo, acctThree } = await loadFixture(deployAddressBookContract);
        let otherAddress = await otherAccount.getAddress()
        let ownerAddress = await owner.getAddress()
        let acctTwoAddress = await acctTwo.getAddress()
        let acctThreeAddress = await acctThree.getAddress()

        const abowner = await AddressBook.deploy(ownerAddress);
        const abOther = await AddressBook.deploy(otherAddress);
        const abAcctTwo = await AddressBook.deploy(acctTwoAddress);
        const abAcctThree = await AddressBook.deploy(acctThreeAddress);

        expect(await abowner.owner()).to.equal(ownerAddress);
        expect(await abOther.owner()).to.equal(otherAddress);
        expect(await abAcctTwo.owner()).to.equal(acctTwoAddress);
        expect(await abAcctThree.owner()).to.equal(acctThreeAddress);


      })
    })
    describe('function addContact',async () => {
        it("it adds a addContact() / increases contactCount / returns correct contact", async () => {
            const { AddressBook, owner, otherAccount, acctTwo, acctThree } = await loadFixture(deployAddressBookContract);
            let ownerAddress = await owner.getAddress()
            let otherAddress = await otherAccount.getAddress()
            const ab = await AddressBook.deploy(ownerAddress);
            let _firstName = "Taco"
            let _lastName = "Paco"
            let  _phoneNumbers = [1235434,235357657]

            await ab.connect(owner).addContact(_firstName, _lastName, _phoneNumbers)

            let contacts = await ab.contactCount()
            let contactID = Number(contacts) - 1
            let contact = await ab.getContact(contactID)
            expect(contacts).to.eq(1)

            // only have added one contact, so contactCount will be 1
            expect(contact[0]).to.eq(contacts)
            expect(contact[1]).to.eq(_firstName)
            expect(contact[2]).to.eq(_lastName)
            expect(contact[3][0]).to.eq(_phoneNumbers[0])
            expect(contact[3][1]).to.eq(_phoneNumbers[1])

        })
        it("function returns correct array of contacts getAllContacts()", async () => {
            const { AddressBook, owner, otherAccount, acctTwo, acctThree } = await loadFixture(deployAddressBookContract);
            let contact_list = require('../data/contacts.json');
            let ownerAddress = await owner.getAddress()
            let otherAddress = await otherAccount.getAddress()
            const ab = await AddressBook.deploy(ownerAddress);

            for(let i = 0; i < contact_list.length; i++) {
                await ab.connect(owner).addContact(contact_list[i].firstName, contact_list[i].lastName, contact_list[i].phoneNumbers)
            }

            let contacts = await ab.contactCount()
            let contactID = Number(contacts) - 1
            let contact = await ab.getContact(contactID)
            expect(contacts).to.eq(contact_list.length)

            let all_contacts = await ab.getAllContacts()

            for(let i = 0; i < contact_list.length; i++) {
                expect(all_contacts[i][0]).to.eq(i + 1)
                expect(all_contacts[i][1]).to.eq(contact_list[i].firstName)
                expect(all_contacts[i][2]).to.eq(contact_list[i].lastName)
                for(let j = 0; j < all_contacts[i][3].length; j++) {
                    expect(all_contacts[i][3][j]).to.eq(contact_list[i].phoneNumbers[j])
                }
            }
        })
        it('only owner of Address Book Contract can call addContact', async () => {
            const { AddressBook, owner, otherAccount, acctTwo, acctThree } = await loadFixture(deployAddressBookContract);
            let ownerAddress = await owner.getAddress()
            let otherAddress = await otherAccount.getAddress()
            const ab = await AddressBook.deploy(ownerAddress);
            let _firstName = "Taco"
            let _lastName = "Paco"
            let  _phoneNumbers = [1235434,235357657]

            await expect(ab.connect(otherAccount).addContact(_firstName, _lastName, _phoneNumbers)).to.be.revertedWithCustomError(ab, "OwnableUnauthorizedAccount")
            .withArgs(otherAddress);
            

        })
    })
    describe('deleting contacts', () => {
        it("deletes a contact and re-organizes the contacts array", async () => {
            const { AddressBook, owner, otherAccount } = await loadFixture(deployAddressBookContract);
            let contact_list = require('../data/contacts.json')
            let ownerAddress = await owner.getAddress()
            const ab = await AddressBook.deploy(ownerAddress);

            for(let i = 0; i < contact_list.length; i++) {
                await ab.connect(owner).addContact(contact_list[i].firstName, contact_list[i].lastName, contact_list[i].phoneNumbers)
            }

            let length = await ab.getContactsLength()
            const deletedID = 2
            await ab.connect(owner).deleteContact(deletedID)
            let new_length = await ab.getContactsLength()

            expect(new_length).to.eq(contact_list.length - 1)


            
            let all_contacts = await ab.getAllContacts()
            expect(all_contacts.length).not.to.eq(length)

            for(let i = 0; i < new_length; i++) {
                if(i > 1) {
                    expect(all_contacts[i][1]).to.eq(contact_list[i+1].firstName)
                    expect(all_contacts[i][2]).to.eq(contact_list[i+1].lastName)
                } else {
                    expect(all_contacts[i][1]).to.eq(contact_list[i].firstName)
                    expect(all_contacts[i][2]).to.eq(contact_list[i].lastName)
                }
            }
        })
        it("deleteContact() reverts if not owner", async () => {
            const { AddressBook, owner, otherAccount } = await loadFixture(deployAddressBookContract);
            let ownerAddress = await owner.getAddress()
            let otherAddress = await otherAccount.getAddress()

            const ab = await AddressBook.deploy(ownerAddress);
            let _firstName = "Taco"
            let _lastName = "Paco"
            let  _phoneNumbers = [1235434,235357657]

            await ab.connect(owner).addContact(_firstName, _lastName, _phoneNumbers)

            let contacts = await ab.contactCount()

            await expect(ab.connect(otherAccount).deleteContact(contacts)).to.be.revertedWithCustomError(ab, "OwnableUnauthorizedAccount")
            .withArgs(otherAddress);
        })
        it("deleteContact() reverts if contact is not found", async () => {
            const { AddressBook, owner, otherAccount, acctTwo, acctThree } = await loadFixture(deployAddressBookContract);
            let ownerAddress = await owner.getAddress()
            let otherAddress = await otherAccount.getAddress()
            const ab = await AddressBook.deploy(ownerAddress);
            let _firstName = "Taco"
            let _lastName = "Paco"
            let  _phoneNumbers = [1235434,235357657]

            await ab.connect(owner).addContact(_firstName, _lastName, _phoneNumbers)

            let contacts = await ab.contactCount()
            contacts++

            await expect(ab.connect(owner).deleteContact(contacts)).to.be.revertedWithCustomError(ab, "ContactNotFound")
            .withArgs(contacts);
        })
    });
});
