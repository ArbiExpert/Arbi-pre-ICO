pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/token/StandardToken.sol';

contract ArbiPreIco is Ownable {
    using SafeMath for uint256;
    
    //the token being sold
    ERC20 arbiToken;
    address public tokenAddress;

    /* owner of tokens to spend */ 
    address public tokenOwner;
    
    uint public startTime;
    uint public endTime;
    uint public price;

    uint public hardCapAmount = 33333200;

    uint public tokensRemaining = hardCapAmount;

    /**
    * event for token purchase logging
    * @param beneficiary who got the tokens
    * @param amount amount of tokens purchased
    */ 
    event TokenPurchase(address indexed beneficiary, uint256 amount);

    function ArbiPreIco(address token, address owner, uint start, uint end) public {
        tokenAddress = token;
        tokenOwner = owner;
        arbiToken = ERC20(token);
        startTime = start;
        endTime = end;
        price = 0.005 / 100 * 1 ether; //1.00 token = 0.005 ether
    }

    /**
    * fallback function to receive ether 
    */
    function () payable {
        buyTokens(msg.sender);
    }

    function buyTokens(address beneficiary) public payable {
        require(beneficiary != 0x0);
        require(isActive());
        require(msg.value >= 0.01 ether);
        uint amount = msg.value;
        uint tokenAmount = amount.div(price);
        makePurchase(beneficiary, tokenAmount);
    }

    function sendEther(address _to, uint amount) onlyOwner {
        _to.transfer(amount);
    }
    
    function isActive() constant returns (bool active) {
        return now >= startTime && now <= endTime && tokensRemaining > 0;
    }
    
    /** 
    * function for external token purchase 
    * @param _to receiver of tokens
    * @param amount of tokens to send
    */
    function sendToken(address _to, uint256 amount) onlyOwner {
        makePurchase(_to, amount);
    }

    function makePurchase(address beneficiary, uint256 amount) private {
        require(amount <= tokensRemaining);
        arbiToken.transferFrom(tokenOwner, beneficiary, amount);
        tokensRemaining = tokensRemaining.sub(amount);
        TokenPurchase(beneficiary, amount);
    }
    
}