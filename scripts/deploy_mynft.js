const hre = require("hardhat");

async function main() {
  const signers = await hre.ethers.getSigners();
  if (signers.length === 0) {
    throw new Error("No signers found. Check PRIVATE_KEY in .env");
  }
  const deployer = signers[0];
  console.log("Deploying MyNFT with account:", deployer.address);

  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const nft = await MyNFT.deploy("MyNFT", "MNFT");
  await nft.deployed();

  console.log("MyNFT deployed to:", nft.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
