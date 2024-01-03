// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WeightedVoting is ERC20 {
    using EnumerableSet for EnumerableSet.AddressSet;

    error TokensClaimed();
    error AllTokensClaimed();
    error NoTokensHeld();
    error QuorumTooHigh(uint amountProposed);
    error AlreadyVoted();
    error VotingClosed();

    error CurrentlyClaiming();

    uint public maxSupply;
    uint public claimableAmount;

    uint public issueNum; // not used for internal checks, just allows a quick look up of the max issue ID

    // 1 vote per token, if a token holder holds 1000 tokens, they will have a voter power of 1000
    struct Issue {
        EnumerableSet.AddressSet voters;
        string issueDesc;
        uint votesFor;
        uint votesAgainst;
        uint votesAbstain;
        uint totalVotes;
        uint quorum;
        bool passed;
        bool closed;
    }

    // Allows for a return of voters as an Array - EnumerableSet.AddressSet is a mapping
    struct ReturnIssue {
        address[] voters;
        string issueDesc;
        uint votesFor;
        uint votesAgainst;
        uint votesAbstain;
        uint totalVotes;
        uint quorum;
        bool passed;
        bool closed;
    }

    enum Votes {
        AGAINST,
        FOR,
        ABSTAIN
    }

    Issue[] private issues;
    mapping(address => bool) public hasClaimed;
    mapping(address => bool) private claiming;

    constructor() ERC20("WeightedVoting", "WV") {
        Issue storage zeroeth = issues.push();
        zeroeth.closed = true;
        claimableAmount = 100;
        maxSupply = 1000000;
    }

    /*
    @dev modifier prevents re-entrnacy and callers from multiple claims
    */
    modifier Claimable() {
        if (hasClaimed[msg.sender]) revert TokensClaimed();
        if (claiming[msg.sender]) revert CurrentlyClaiming();
        claiming[msg.sender] = true;
        _;
        claiming[msg.sender] = false;
    }

    /*
    @dev modifier prevents non-token holders from calling functions
    */
    modifier membersOnly() {
        if (balanceOf(msg.sender) == 0) revert NoTokensHeld();
        _;
    }

    /*
    @dev When called, any wallet can claim the claimable amount as long as the totalSupply + claimable amount is less than maxSupply,
    wallets can only claim one time. if wallet has claimed, it will revert with TokensClaimed, see modifier Claimable()

    if  all tokens have been claimed, will revert with an error AllTokensClaimed.
    */

    function claim() external Claimable {
        if (totalSupply() + claimableAmount > maxSupply)
            revert AllTokensClaimed();
        hasClaimed[msg.sender] = true;
        _mint(msg.sender, claimableAmount);
    }

    /*
    @dev createIssue allows holders of Token to create a new issue that other holders can vote on.
    params: string to describe the issue and the amount of votes needed to pass yes or no, but not abstain votes
    ** quorum cannot be greater that the total supply
    
    returns the index of the newly-created issue.
    */
    function createIssue(
        string calldata _issueDesc,
        uint _quorum
    ) external membersOnly returns (uint) {
        if (_quorum > totalSupply()) revert QuorumTooHigh(_quorum); // _quorum amount must be less or equal to the totalSupply
        Issue storage _issue = issues.push();
        _issue.issueDesc = _issueDesc;
        _issue.quorum = _quorum;
        issueNum++;
        return issueNum;
    }

    /*
    @dev, external function that returns an issue that.
    param: issue ID
    will return a ReturnIssue struct that uses an address[] instead of EnumerableSet.AddressSet
    */
    function getIssue(
        uint _issueID
    ) external view returns (ReturnIssue memory) {
        Issue storage _issue = issues[_issueID];
        uint voterCount = _issue.voters.length();
        address[] memory _voters = new address[](voterCount);
        for (uint i; i < voterCount; i++) {
            _voters[i] = _issue.voters.at(i);
        }
        ReturnIssue memory returnIssue = ReturnIssue(
            _voters,
            _issue.issueDesc,
            _issue.votesFor,
            _issue.votesAgainst,
            _issue.votesAbstain,
            _issue.totalVotes,
            _issue.quorum,
            _issue.passed,
            _issue.closed
        );
        return returnIssue;
    }

    /*
    @dev external function, mostly used to Hardhat testing,
    provides calling the the length of the EnumerableSet.AddressSet voters.
    */
    function getUsers(uint _issueID) external view returns (uint) {
        return issues[_issueID].voters.length();
    }

    /*


    @dev params:  _issueId and the token holder's vote. vote input is 0, 1, or 2 based on the Votes enum.
        0 - AGAINST,
        1 - FOR,
        2 - ABSTAIN

    

    Holders vote all of their tokens for, against, or abstaining from the issue.
    This amount should be added to the appropriate member of the issue and the total number of votes collected.

    If a vote takes the total number of votes to or above the quorum for that vote, then:

        The issue should be set so that closed is true
        If there are more votes for than against, set passed to true
        **if votesFor equal votesAgainst, then the issue passed will be set to false
    will revert if the issue is closed, the wallet has already voted on this issue, or the wallet is not a token holder
    */

    function vote(uint _issueID, Votes voteType) external membersOnly {
        Issue storage _issue = issues[_issueID];
        if (_issue.closed) revert VotingClosed();
        if (_issue.voters.contains(msg.sender)) revert AlreadyVoted();
        _issue.voters.add(msg.sender);

        if (voteType == Votes.FOR) {
            _issue.votesFor += balanceOf(msg.sender);
        } else if (voteType == Votes.AGAINST) {
            _issue.votesAgainst += balanceOf(msg.sender);
        } else {
            _issue.votesAbstain += balanceOf(msg.sender);
        }
        _issue.totalVotes += balanceOf(msg.sender);
        if (_issue.totalVotes >= _issue.quorum) {
            _issue.closed = true;
            _issue.votesFor > _issue.votesAgainst
                ? _issue.passed = true
                : _issue.passed = false;
        }
    }

    // getter function to check if an issue is open or closed.
    function issueClosed(uint _issueID) external view returns (bool) {
        return issues[_issueID].closed;
    }

    function decimals() public pure override returns (uint8) {
        return 0;
    }
}
