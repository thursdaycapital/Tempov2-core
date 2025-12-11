const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // ALREADY DEPLOYED
  const factoryAddress = "0xC5dC58c2E291f2515F63457C5dba0890037b5eFB";
  const wusdAddress = "0x50AE14D2044ad2fD0490be149e88a6F1D29617db";
  const routerAddress = "0xBB8B71E95396C01EB1cA9425624552F5134B830d";

  console.log("Using existing UniswapV2Factory:", factoryAddress);
  console.log("Using existing WUSD:", wusdAddress);
  console.log("Using existing UniswapV2Router02:", routerAddress);

  // 4. Deploy Tokens
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  
  const libToken = await MockERC20.deploy("LIB Token", "LIB");
  await libToken.deployed();
  console.log("LIB Token deployed to:", libToken.address);

  const libUSD = await MockERC20.deploy("Tempo USD", "libUSD");
  await libUSD.deployed();
  console.log("libUSD Token deployed to:", libUSD.address);

  console.log("\nCopy these addresses to your frontend config!");
  console.log({
    factory: factoryAddress,
    router: routerAddress,
    wusd: wusdAddress,
    lib: libToken.address,
    libUSD: libUSD.address
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
