//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract CoffeeFactory {
    uint256 totalCoffee;
    address payable public owner;

    event NewCoffeeHurray(
        address indexed from,
        uint256 timestamp,
        string message,
        string name
    );

    // constructor is payble for make the owner payable... in order to receive coffee, ofc!
    constructor() payable {
        console.log('Time to pay some fresh coffee!');

        owner = payable(msg.sender);
    }

    struct Coffee {
        address giver;
        string message;
        string name;
        uint256 timestamp;
    }

    Coffee[] offeredCoffee;

    function getAllCoffee() public view returns (Coffee[] memory) {
        return offeredCoffee;
    }

    function getTotalCoffee() public view returns (uint256) {
        console.log("We have received %d coffeeeeee!", totalCoffee);
        return totalCoffee;
    }

    function buyACoffee(
        string memory _message,
        string memory _name
    ) public payable {
        uint256 cost = 0.001 ether;
        require(msg.value >= cost, "Not enough for a coffee :(");

        totalCoffee += 1;
        console.log("%s just sent a coffee with amount %s", msg.sender, msg.value);

       offeredCoffee.push(Coffee(msg.sender, _message, _name, block.timestamp));

        uint256 contractAmount = address(this).balance;
        console.log("Contract now have %d", contractAmount);

       // money are sent to the contract through payable
       // here we can order to the contract to send money to the owner,
        // in order to automatically pass the money without withdraw needed
       // read https://solidity-by-example.org/payable for further infos

        // OFC I DONT KNOW IF ITS A GOOD PATTERN OR NOT, SO DONT YANK IT in production
       // or i think this was the idea but... it doesnt work if contract
       // balance is 0 so its weird

        (bool success, ) = owner.call{ value: contractAmount }("");
        require(success, "Failed to send money");

       emit NewCoffeeHurray(msg.sender, block.timestamp, _message, _name);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Hey, you arent the owner!");
        _;
    }

    function withdraw() public onlyOwner {
        // get all the $$$$$$
        uint amount = address(this).balance;

        // send all to the owner
        (bool success, ) = owner.call{ value: amount }("");
        require(success, "Oh noes, cannot send the cash :(");
    }

}
