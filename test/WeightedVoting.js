const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("WeightedVoting", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  deployWeightedVotingContract = async () => {

    // Contracts are deployed using the first signer/account by default
    const [ owner, otherAccount, acctTwo, acctThree ] = await ethers.getSigners();
    const name = "WeightedVoting"
    const symbol = "WV"
    const decimals = 0
    const WeightedVoting = await ethers.getContractFactory("WeightedVoting");
    const wv = await WeightedVoting.deploy();

    return { wv, owner, otherAccount, acctTwo, acctThree, name, symbol, decimals };
  }
  describe("Deployment", async () => {
    it("it should set the correct owner", async () => {
      const { wv, name, symbol } = await loadFixture(deployWeightedVotingContract);

      expect(await wv.name()).to.equal(name);
      expect(await wv.symbol()).to.equal(symbol);
    })
    it('Should have a max supply', async () => {
      const { wv, decimals } = await loadFixture(deployWeightedVotingContract);
      expect(await wv.decimals()).to.equal(decimals);
      let number = await wv.maxSupply()
      expect(parseInt(number)).to.equal(1000000);
    })
  })
  describe('Claiming',async () => {
    it('should allow users to Claim and Increase total supply', async () => {
      const { wv, otherAccount } = await loadFixture(deployWeightedVotingContract);
      const balanceBefore = await wv.balanceOf(otherAccount.address);
      expect(balanceBefore).to.equal(0);
      await wv.connect(otherAccount).claim()
      const claimableAmount = await wv.claimableAmount()
      const balanceAfter = await wv.balanceOf(otherAccount.address);

      const totalSupply = await wv.totalSupply();

      expect(balanceAfter).to.equal(claimableAmount)
      expect(totalSupply).to.equal(claimableAmount) // will fail if testing for max supply below (must mint in construcor)
      await expect(wv.connect(otherAccount).claim()).to.be.reverted
    })
    it("Should not mint above the Max Supply", async () => {
      /*
      //ONLY WORKS IF INTERNAL _mint() IS CALLED IN CONSTRUCTER
      const { wv, otherAccount, acctTwo, acctThree, decimals } = await loadFixture(deployWeightedVotingContract);
      
      const acctTwoBalanceBefore = await wv.balanceOf(acctTwo.address);
      const acctThreeBalanceBefore = await wv.balanceOf(acctThree.address);
      expect(acctTwoBalanceBefore).to.equal(0);
      expect(acctThreeBalanceBefore).to.equal(0);


      let totalSupply = await wv.totalSupply();
      let maxSupply = await wv.maxSupply();
      let claimableAmount = await wv.claimableAmount()
      
      console.log(maxSupply)
      console.log(claimableAmount)
      console.log(totalSupply)


      expect(totalSupply).to.equal(maxSupply - claimableAmount)

      await wv.connect(acctTwo).claim()
      totalSupply = await wv.totalSupply();

      console.log(totalSupply)


      await expect(wv.connect(acctThree).claim()).to.be.reverted

      const totalSupplyTwo = await wv.totalSupply();
      expect(totalSupply).to.equal(totalSupplyTwo)

      const acctTwoBalanceAfter = await wv.balanceOf(acctTwo.address);
      const acctThreeBalanceAfter = await wv.balanceOf(acctThree.address);


      const totalSupplyThree = await wv.totalSupply();
      expect(totalSupply).to.equal(totalSupplyThree)

      expect(acctTwoBalanceAfter).to.equal(claimableAmount)
      expect(acctThreeBalanceAfter).to.equal(0)

      await expect(wv.connect(otherAccount).claim()).to.be.reverted
      */
    })
    it("createIssue should revert for no coiners", async () => {
      const { wv, acctThree } = await loadFixture(deployWeightedVotingContract);
      await expect(wv.connect(acctThree).createIssue("MY ISSUE", 1000)).to.be.reverted

    })
    it("createIssue should work for coiners", async () => {
      const { wv, acctThree } = await loadFixture(deployWeightedVotingContract);
      await expect(wv.connect(acctThree).createIssue("MY ISSUE", 1000)).to.be.reverted
      let claimableAmount = await wv.claimableAmount()
      await wv.connect(acctThree).claim()
      const balanceBefore = await wv.balanceOf(acctThree.address);
      expect(balanceBefore).to.eq(claimableAmount)

      await wv.connect(acctThree).createIssue("MY ISSUE", 50)
      let issueNum = await wv.issueNum()
      expect(issueNum).to.eq(1)


    })
    it("should allow holders to create issues", async () => {
      const { wv, decimals } = await loadFixture(deployWeightedVotingContract);
      const [ owner, acct1, acct2, acct3, acct4, acct5, acct6, acct7, acct8, acct9 ] = await ethers.getSigners();
      let accounts = [ owner, acct1, acct2, acct3, acct4, acct5, acct6, acct7, acct8, acct9 ]
      let totalSupply = await wv.totalSupply();
      expect(totalSupply).to.equal(0)
      const quorum = ethers.parseUnits("600", decimals)
      console.log(quorum)

      for(let i = 0; i < accounts.length; i++) {
        await wv.connect(accounts[i]).claim()
      }

      totalSupply = await wv.totalSupply();
      let claimableAmount = await wv.claimableAmount()
      let totalClaimed = BigInt(0);
      for(let i = 0; i < accounts.length; i++) {
        totalClaimed += claimableAmount 
      }
      expect(totalSupply).to.equal(totalClaimed)

      let issueNum = await wv.issueNum()
      expect(issueNum).to.eq(0)

      await wv.connect(acct3).createIssue("MY ISSUE", quorum)
      issueNum = await wv.issueNum()
      expect(issueNum).to.eq(1)

      let issue = await wv.getIssue(1)
      console.log(issue)

      for(let i = 0; i < accounts.length; i++) {
        let isClosed = await wv.issueClosed(1)
        console.log(isClosed)
        if(!isClosed) {
          let votingNum = Math.random()
          let isVoting
  
          if(votingNum > 0.75) {
            isVoting = 0
          } else if(votingNum > 0.20) {
            isVoting = 1
          } else {
            isVoting = 2
          }
          await wv.connect(accounts[i]).vote(issueNum, isVoting)
          console.log("--------------")
          console.log(accounts[i].address)
          console.log(votingNum)
          console.log(isVoting)
        } else {
          console.log(isClosed)
        }
      }
      console.log("-----------------------")
      console.log("-----------------------")

      let userlength = await wv.getUsers(1)
      console.log(userlength)

      let newIssue = await wv.getIssue(1)
      console.log(newIssue)
    })
  })
});
