const { expect } = require("chai")
const { ethers } = require("hardhat")

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

  it("the voter votes for a proposal candidate", async function () {
    const [, voter] = await ethers.getSigners()

    // * voter votes
    await this.ballot.connect(voter).vote(0)
    // * check if voter has voted
    const voterAddress = await voter.getAddress()
    const voterResp = await this.ballot.voters(voterAddress)
    expect(voterResp.voted).to.equal(true)
  })

  it("the voteCount of proposal candidate 0 should be 1 after running the previous call", async function () {
    const proposal = await this.ballot.proposals(0)
    expect(proposal.voteCount.toString()).to.equal("1")
  })

  it("the same voter votes for another candidate now", async function () {
    try {
      const [, voter] = await ethers.getSigners()
      await this.ballot.connect(voter).vote(1)
    } catch (err) {
      expect(err.toString()).to.includes("Voter has already voted")
    }
  })

  it("the voteCount of proposal candidate 1 should be 0 after running the previous call", async function () {
    const proposal = await this.ballot.proposals(1)
    expect(proposal.voteCount.toString()).to.equal("0")
  })

  it("returns the winnerName", async function () {
    const winnerName = await this.ballot.winnerName()
    expect(winnerName.toString()).to.equal(candidates[0])
  })
})
