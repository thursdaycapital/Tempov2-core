const hre = require("hardhat");

async function main() {
  const signers = await hre.ethers.getSigners();
  if (signers.length === 0) {
    throw new Error("No signers found. Check PRIVATE_KEY in .env");
  }
  const deployer = signers[0];
  console.log("Deploying BatchTransfer with account:", deployer.address);

  const BatchTransfer = await hre.ethers.getContractFactory("BatchTransfer");
  const batch = await BatchTransfer.deploy();
  await batch.deployed();

  console.log("BatchTransfer deployed to:", batch.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
