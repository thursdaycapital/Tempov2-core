const hre = require("hardhat");

async function main() {
  const signers = await hre.ethers.getSigners();
  if (signers.length === 0) {
    throw new Error("No signers found. Check your hardhat config and private key.");
  }
  const deployer = signers[0];
  console.log("Deploying contracts with the account:", deployer.address);

  // ALREADY DEPLOYED ADDRESSES
  // const factoryAddress = "0xC5dC58c2E291f2515F63457C5dba0890037b5eFB";
  // const routerAddress = "0xBB8B71E95396C01EB1cA9425624552F5134B830d";
  // const libToken = "0x0F9c2A163cD81c96f5bf4cCba2Eb0C437251e478";
  // const libUSD = "0x9d5bd1F10b6410a23EB90F0F8782bdDaE7ff9cac";

  const TempoFaucet = await hre.ethers.getContractFactory("TempoFaucet");
  const faucet = await TempoFaucet.deploy();
  await faucet.deployed();

  console.log("TempoFaucet deployed to:", faucet.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
