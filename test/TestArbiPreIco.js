const ArbiPreIco = artifacts.require("./ArbiPreIco.sol");
const ArbiToken = artifacts.require("./ARBI.sol");

import moment from 'moment'
import ether from './helpers/ether'
import latestTime from './helpers/latestTime'
import increaseTime from './helpers/increaseTime'
import EVMThrow from './helpers/EVMThrow'

const BigNumber = web3.BigNumber

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

contract('ArbiPreIco', accounts => {

	const mainAccount = accounts[0]
	const beneficiary = accounts[1]

	beforeEach(async function () {
		this.startTime = latestTime().add(1, 'day').unix()
		this.endTime = latestTime().add(3, 'day').unix()

		this.arbiToken = await ArbiToken.new();
		this.arbiPreIco = await ArbiPreIco.new(this.arbiToken.address, mainAccount, this.startTime, this.endTime);
		const cap = await this.arbiPreIco.hardCapAmount()
		await this.arbiToken.mint(mainAccount, cap)
		await this.arbiToken.approve(this.arbiPreIco.address, cap)
	})

	it('should have allowed tokens to spend', async function() {
		const allowance = await this.arbiToken.allowance(mainAccount, this.arbiPreIco.address)
		const cap = await this.arbiPreIco.hardCapAmount()
		assert.equal(cap.valueOf(), allowance.valueOf(), "allowance should work on all tokens")
	})

	it('should not allow token purchase before ico is active', async function() {
		await this.arbiPreIco.sendTransaction({from: beneficiary, value: ether(0.002)}).should.be.rejectedWith(EVMThrow)
	})

	it('should not allow token purchase after ico is active', async function() {
		await increaseTime(moment.duration(4, 'day'))
		await this.arbiPreIco.sendTransaction({from: beneficiary, value: ether(0.002)}).should.be.rejectedWith(EVMThrow)
	})

	describe('test active preico:', async function() {

		beforeEach(async function() {
			await increaseTime(moment.duration(2, 'day'))
		})

		it('should return active state on started ico', async function() {
			const active = await this.arbiPreIco.isActive();
			assert.equal(true, active, "active state should be returned")
		})

		it('should buy tokens on payable', async function() {
			await this.arbiPreIco.sendTransaction({from: beneficiary, value: ether(0.02)})
			const boughtTokens = await this.arbiToken.balanceOf(beneficiary)
			assert.equal(400, boughtTokens.valueOf(), "tokens should be bought")
		})

		it('should not accept payments less than 0.01', async function() {
			await this.arbiPreIco.sendTransaction({from: beneficiary, value: ether(0.0099)}).should.be.rejectedWith(EVMThrow)
		})

		it('should decrease remaining tokens parameter after buy', async function () {
			const cap = await this.arbiPreIco.hardCapAmount()
			assert.equal(true, cap.valueOf() > 0, "contract should have cap set")

			await this.arbiPreIco.sendTransaction({from: beneficiary, value: ether(0.01)})
			const remaining = await this.arbiPreIco.tokensRemaining();
			assert.equal(cap - 200, remaining.valueOf(), "remaining tokens value should decrease after successful buy")
		})

		it('should send token on sendToken function owner call', async function() {
			const cap = await this.arbiPreIco.hardCapAmount()
			const initialBeneficiaryBalance = await this.arbiToken.balanceOf(beneficiary);
			assert.equal(0, initialBeneficiaryBalance, "initial beneficiary balance should be zero")
			await this.arbiPreIco.sendToken(beneficiary, 300)
			const balance = await this.arbiToken.balanceOf(beneficiary)
			assert.equal(300, balance.valueOf(), "tokens should be sent to beneficiary")
			const totalTokens = await this.arbiPreIco.tokensRemaining()
			assert.equal(cap - 300, totalTokens, "should decrease total supply")
		})

		it('should throw if more tokens than cap are sent', async function() {
			const cap = await this.arbiPreIco.hardCapAmount()
			await this.arbiPreIco.sendToken(beneficiary, cap + 1).should.be.rejectedWith(EVMThrow)
		})

		it('should allow all tokens to be bought and close ico after that', async function() {
			const cap = await this.arbiPreIco.hardCapAmount()
			await this.arbiPreIco.sendToken(beneficiary, cap.valueOf());
			const balance = await this.arbiToken.balanceOf(beneficiary);
			assert.equal(balance.valueOf(), cap, "all tokens should be bought")
			const isIcoActive = await this.arbiPreIco.isActive();
			assert.equal(isIcoActive, false, "ico should be closed after all tokens are bought")
		})

		it('should send ether', async function() {
			await this.arbiPreIco.sendTransaction({from: beneficiary, value: ether(0.02)})
			const balance = web3.eth.getBalance(accounts[2]);
			await this.arbiPreIco.sendEther(accounts[2], ether(0.02))
			assert.equal(balance.plus(ether(0.02)).valueOf(), web3.eth.getBalance(accounts[2]).valueOf(), "ether should be sent")
		})

		it('should not send ether on not owner call', async function() {
			await this.arbiPreIco.sendTransaction({from: beneficiary, value: ether(0.02)})
			await this.arbiPreIco.sendEther(beneficiary, ether(0.01), {from: beneficiary}).should.be.rejectedWith(EVMThrow)
		})

		it('should not allow to buy more tokens than cap with fallback function', async function() {
			const cap = await this.arbiPreIco.hardCapAmount()
			await this.arbiPreIco.sendToken(accounts[3], cap - 1) //leave 1 token remaining
			const price = await this.arbiPreIco.price()
			const allTokenPrice = cap.valueOf() * price.valueOf()
			await this.arbiPreIco.sendTransaction({from: beneficiary, value: ether(1.001)}).should.be.rejectedWith(EVMThrow)
		})

	})

});
