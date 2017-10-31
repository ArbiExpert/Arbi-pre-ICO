require('babel-register');
require('babel-polyfill');

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      //from: '0xfe00a80d73045eb7c4edbdd4fe2f3c9f11ef9d5e'
    },
    ropsten: {
     network_id: 3,
     host: "localhost",
     port:  8545,
     // gasprice: 500000000
    },
    rinkeby: {
     network_id: 4,
     host: "localhost",
     port:  8545,
     // gasprice: 500000000
    },

  }
};
