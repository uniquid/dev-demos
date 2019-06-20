module.exports = (
  /** @type {import('../types').UIDNodeFunctions} */ nodeFns,
  /** @type {import('../types').NodeEventBus} */ nodeBus,
  /** @type {import('../types').ClientEventBus} */ clientBus,
  /** @type {()=>import('../types').AppState} */ getState,
  /** @type {number} */ pollContractsTimeout,
  /** @type {number} */ pollLedStatusTimeout
) => {
  /** @type {import('../types').AppState} */
  clientBus.on('requestToggleLed', async (contract) => {
    try {
      /* const resp =  */ await nodeFns.requestToggleLed(contract)
      nodeBus.emit('toggleLedResponse', { contract })
    } catch (e) {
      const error = `Error requestToggleLed : ${e}`
      console.error(error, contract.identity, contract.providerName, contract.contractor)
      nodeBus.emit('toggleLedResponse', {
        contract: contract,
        error
      })
    }
  })

  pollContracts()
  return {
    clientBus,
    nodeBus
  }

  async function pollContracts () {
    try {
      const contracts = await nodeFns.getContracts()
      startPollingReadLedForNewContracts(contracts, getState().deviceStatuses.map((devStatus) => devStatus.contract))
      setTimeout(pollContracts, pollContractsTimeout)
      nodeBus.emit('gotContracts', contracts)
    } catch (e) {
      console.error(`ERROR getContracts`, e)
    }
  }

  function startPollingReadLedForNewContracts (
    /** @type {import('@uniquid/uidcore/typings/types/data/Contract').UserContract[]} */ newContracts,
    /** @type {import('@uniquid/uidcore/typings/types/data/Contract').UserContract[]} */ oldContracts
  ) {
    newContracts
      .filter((newCtr) => !oldContracts.find((oldCtr) => oldCtr.contractor === newCtr.contractor))
      .forEach(getLedStatus)
  }

  async function getLedStatus (
    /** @type {import('@uniquid/uidcore/typings/types/data/Contract').UserContract} */ contract
  ) {
    try {
      const ledStatus = await nodeFns.getLedStatus(contract)
      nodeBus.emit('gotLedStatus', { ledStatus, contract: contract })
    } catch (e) {
      const error = `Error requestReadLedStatus : ${e}`
      console.error(error, contract.identity, contract.providerName, contract.contractor)
      nodeBus.emit('gotLedStatus', { error, contract: contract })
    }
    getState()
      .deviceStatuses.map((status) => status.contract)
      .find((currCtr) => currCtr.contractor === contract.contractor) &&
      setTimeout(() => getLedStatus(contract), pollLedStatusTimeout)
  }
}
