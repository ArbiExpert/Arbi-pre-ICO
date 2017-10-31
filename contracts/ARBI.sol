pragma solidity ^0.4.15;
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/token/StandardToken.sol';

contract ARBI is StandardToken, Ownable {

	string public name;
	string public symbol;
	uint8 public decimals;

	event Burn(address indexed from, uint256 value);
	event Mint(address indexed receiver, uint256 value);

	function ARBI() {
		totalSupply = 5000000;
		balances[msg.sender] = totalSupply;
		name = "ARBI Token";
		symbol = "ARBI";
		decimals =  2;
	}

	function mint(address receiver, uint256 amount) onlyOwner returns (bool success) {
		balances[receiver] = balances[receiver].add(amount);
		totalSupply = totalSupply.add(amount);
		Mint(receiver, amount);
		return true;
	}

	function burn(address from, uint256 value) onlyOwner 
	returns (bool success) {
		require(balances[from] >= value);

		balances[from] = balances[from].sub(value);
		totalSupply = totalSupply.sub(value);
		Burn(from, value);
		return true;
	}

	function getResult() constant returns (uint256) {
        return 1001;
    }

}
