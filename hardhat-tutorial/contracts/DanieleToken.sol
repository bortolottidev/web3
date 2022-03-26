pragma solidity ^0.7.0;

import "hardhat/console.sol";

contract DanieleToken {
    string public name = "Daniele Bortolotti Token";
    string public symbol = "DBT";

    // Definetly not a shit token!
    uint256 public totalSupply = 1000;

    address public owner;

    mapping(address => uint256) balances;

    // Only called during contract creation
    constructor() {
        // Let send all to.. me!
        balances[msg.sender] = totalSupply;

        owner = msg.sender;
    } 

    function transfer(address to, uint256 amount) external {
        console.log("Sender balance is %s tokens", balances[msg.sender]);
        console.log("Trying to send %s tokens to %s", amount, to);

        // Assert check
        require(balances[msg.sender] >= amount, "Not enought money, broz");

        balances[msg.sender] -= amount;
        balances[to] += amount;
    }

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }
}
