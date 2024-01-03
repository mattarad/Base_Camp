// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {


  // const contract_name_here = await hre.ethers.deployContract("Contract_Name_Here");

  // await contract_name_here.waitForDeployment();

  // console.log(
  //   `Contract_Name_Here deployed to ${lock.contract_name_here}`
  // );

  console.log("Deploy Script is not set up.")
  console.log("to set up, replace Contract_Name_Here with the contract you wish to deploy")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
