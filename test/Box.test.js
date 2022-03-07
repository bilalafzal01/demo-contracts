const { expect } = require("chai");

describe("Box", function () {
  before(async function () {
    this.Box = await ethers.getContractFactory("Box");
  });

  beforeEach(async function () {
    this.box = await this.Box.deploy();
    await this.box.deployed();
  });

  it("retrieve returns a value previously stored", async function () {
    await this.box.store(42);
    expect((await this.box.retrieve()).toString()).to.equal("42");
  });
});
