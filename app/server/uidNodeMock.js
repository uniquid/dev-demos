/** @type {import('../types').UIDNodeFunctions} */
const nodeFunctionsMock = {
  getContracts,
  getLedStatus,
  requestToggleLed,
  nodeInfo: {
    imprintingAddress: '#imprintingAddress#',
    nodename: '#nodename#',
    orchestrateAddress: '#orchestrateAddress#',
    baseXpub: '#baseXpub#'
  }
}
/** @type {Promise<import('../types').UIDNodeFunctions>} */
module.exports = Promise.resolve(nodeFunctionsMock)
/** @type {import('../types').UIDNodeFunctions['getContracts']} */
function getContracts () {
  /** @type {(_:any)=>import('@uniquid/uidcore/typings/types/data/Contract').UserContract} */
  const ctr = (postfix) => ({
    identity: {
      // @ts-ignore
      role: 'USER',
      index: 3
    },
    contractor: 'contractor-IdAddress' + postfix,
    revoker: 'revoker-IdAddress',
    payload: [13, 45],
    revoked: null,
    providerName: '--providerName',
    received: 43224
  })

  return new Promise((resolve, reject) => {
    setTimeout(() => resolve([ctr(1), ctr(2), ctr(3), ctr(4), ctr(5)]), 500)
  })
}

/** @type {import('../types').UIDNodeFunctions['getLedStatus']} */
function getLedStatus (dev) {
  return new Promise((resolve, reject) => {
    setTimeout(() => (Math.random() > 0.5 ? resolve(Math.random() > 0.5) : reject('##ERR:getLedStatus##')), 2000)
  })
}

/** @type {import('../types').UIDNodeFunctions['requestToggleLed']} */
function requestToggleLed (dev) {
  return new Promise((resolve, reject) => {
    setTimeout(() => (Math.random() > 0.5 ? resolve() : reject('##ERR:requestToggleLed##')), 2000)
  })
}
