async function main() {
  const address = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
  const Box = await ethers.getContractFactory("Box");
  const box = await Box.attach(address);

  let value = await box.retrieve();
  console.log(`Box value is ${value.toString()}`);

  await box.store(23);
  value = await box.retrieve();
  console.log(`Box value is ${value.toString()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
