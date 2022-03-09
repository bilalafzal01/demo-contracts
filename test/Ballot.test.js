const { expect } = require("chai")

const candidates = ["bilal", "aimen"]

describe("Ballot", function () {
  before(async function () {
    this.Ballot = await ethers.getContractFactory("Ballot")
    this.ballot = await this.Ballot.deploy(candidates)
    await this.ballot.deployed()
  })

  it("retrieves the first candidate bilal", async function () {
    const candidate = await this.ballot.proposals(0)
    expect(candidate.name.toString()).to.equal(candidates[0])
  })

  it("retrieves the second candidate aimen", async function () {
    const candidate = await this.ballot.proposals(1)
    expect(candidate.name.toString()).to.equal(candidates[1])
  })

  it("retrieves & confirms the chairPerson", async function () {
    const chairPerson = await this.ballot.chairPerson()
    const contractAddress = await ethers.provider.getSigner().getAddress()
    expect(chairPerson.toString()).to.equal(contractAddress.toString())
  })

  it("chairPerson gives the right to vote to an address", async function () {
    await this.ballot.chairPerson()
    const voter = await ethers.getSigner(1)
    const voterAddress = await voter.getAddress()
    // * give the right to vote to voter
    await this.ballot.giveRightToVote(voterAddress)
    // * check if voter has the right to vote
    const voterResp = await this.ballot.voters(voterAddress)
    expect(voterResp.voted).to.equal(false)
  })
})
