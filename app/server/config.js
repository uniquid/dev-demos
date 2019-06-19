/** @type {import('../types').Config} */
const config = {
  pollContractsTimeout: 10000,
  pollLedStatusTimeout: 5000,
  port: 3000,
  node: {
    home: './nodeHome',
    bcSeeds: [`testnet-seed.litecointools.com`, `seed-b.litecoin.loshan.co.uk`, `dnsseed-testnet.thrasher.io`],
    nodenamePrefix: 'app-',
    networkNameMapping: {
      'ltc-testnet': 'testnet',
      'ltc-regtest': 'regtest'
    },
    logLevel: 'warning',
    requestTimeout: 3000
  }
}
module.exports = config
