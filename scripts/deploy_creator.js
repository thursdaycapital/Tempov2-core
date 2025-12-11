const hre = require("hardhat");

async function main() {
  const signers = await hre.ethers.getSigners();
  if (signers.length === 0) {
    throw new Error("No signers found");
  }
  const deployer = signers[0];
  console.log("Deploying TokenCreator with account:", deployer.address);

  const TokenCreator = await hre.ethers.getContractFactory("TokenCreator");
  const creator = await TokenCreator.deploy();
  await creator.deployed();

  console.log("TokenCreator deployed to:", creator.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
