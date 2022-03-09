// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

/// @title Voting with delegation
contract Ballot {
    event Voted(address indexed voter, string name, bool vote);
    event RightToVote(address indexed voter);
    event ProposalMade(uint8 proposal, string description);
    event VoteDelegated(address indexed voter, address indexed delegatee);
    event WinnerFound(string name);

    // * a single voter obj
    struct Voter {
        uint256 weight; // *    weight is accumulated by delegation
        bool voted; // *    true, if person has voted
        address delegate; // *  person delegated to
        uint256 vote; // * index of the voted proposal
    }

    // * type for a single proposal
    struct Proposal {
        string name;
        uint256 voteCount;
    }

    address public chairPerson;

    mapping(address => Voter) public voters;

    // * A dynamically sized array of proposals
    Proposal[] public proposals;

    constructor(string[] memory proposalNames) {
        chairPerson = msg.sender;
        voters[chairPerson].weight = 1;

        // * For each proposal name provided, create a proposal object and add it to the proposals array
        for (uint8 i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({name: proposalNames[i], voteCount: 0}));
            emit ProposalMade(i, proposalNames[i]);
        }
    }

    // * give voter the right to vote on this ballot.
    function giveRightToVote(address voter) external {
        require(
            msg.sender == chairPerson,
            "Only chairPerson has the right to give rights to vote"
        );

        require(!voters[voter].voted, "Voter has already voted");
        require(voters[voter].weight == 0);
        voters[voter].weight = 1;
        emit RightToVote(voter);
    }

    // * this function will help us delegate the vote to `to` parameter
    function delegate(address to) external {
        // * assign reference
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "Voter has already voted");
        require(to != msg.sender, "Cannot delegate to self");

        while (voters[to].delegate != address(0)) {
            to = voters[to].delegate;
            require(to != msg.sender, "Cannot delegate to self");
        }

        // * since sender is a reference, this modifies the original value
        Voter storage delegate_ = voters[to];

        require(delegate_.weight >= 1);
        emit VoteDelegated(msg.sender, to);

        sender.voted = true;
        sender.delegate = to;
        if (delegate_.voted) {
            // *    If the delegate already voted, directly add to the number of votes
            proposals[delegate_.vote].voteCount += sender.weight;
            emit Voted(msg.sender, proposals[delegate_.vote].name, true);
        } else {
            delegate_.weight += sender.weight;
        }
    }

    // * give your vote to the proposal
    function vote(uint256 proposal) external {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "Voter has already voted");
        require(sender.weight != 0, "Voter has no right to vote");
        require(proposal < proposals.length, "Proposal does not exist");

        sender.voted = true;
        sender.vote = proposal;

        proposals[proposal].voteCount += sender.weight;
        emit Voted(msg.sender, proposals[proposal].name, true);
    }

    // * this function will calculate the winning proposal
    function winningProposal() public view returns (uint256 winningProposal_) {
        uint256 winningVoteCount = 0;
        for (uint256 i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > winningVoteCount) {
                winningVoteCount = proposals[i].voteCount;
                winningProposal_ = i;
            }
        }
    }

    // * this function will return the winning proposal name
    function winnerName() external view returns (string memory) {
        return proposals[winningProposal()].name;
    }
}
