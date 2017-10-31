const ARBI = artifacts.require('./ARBI.sol');
const ArbiPreIco = artifacts.require('./ArbiPreIco.sol');

module.exports = function(deployer) {
	deployer.deploy(ARBI).then(() => {
		deployer.deploy(ArbiPreIco, ARBI.address, '0xf02155655884877e94c7eacfe44493c47928893c', 1508936367, 1508936367 + 6*60*60);
	})
	// deployer.deploy()
}