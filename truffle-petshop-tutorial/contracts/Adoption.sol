pragma solidity ^0.5.0;

contract Adoption {
    uint public constant ADOPTERS_N = 6;
    address[ADOPTERS_N] public adopters;

    // lets adopt a pet!
    function adopt(uint petId) public returns (uint) {
        require(petId >= 0 && petId <= ADOPTERS_N - 1);

        // msg sender its me!
        adopters[petId] = msg.sender;
        return petId;
    }

    function getAdopters() public view returns (address[ADOPTERS_N] memory) {
        return adopters;
    }
}
