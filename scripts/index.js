const { ethers } = require("hardhat")

async function main() {
  // * Ballot contract
  const Ballot = await ethers.getContractFactory("Ballot")
  console.log(`Deploying Ballot...`)
  const ballot = await Ballot.deploy(["bilal", "aimen"])
  await ballot.deployed()
  console.log(`Ballot deployed at ${ballot.address}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
