const { standardUQNodeFactory } = require('@uniquid/uidcore')
const READ_LED_STATUS_FN = 35
const READ_LED_STATUS_PARAM = ''
const TOGGLE_LED_FN = 34
const TOGGLE_LED_PARAM = 'toggle'
module.exports = factory
async function factory (/** @type {import('../types').UIDNodeConfig} */ config) {
  const uidConfig = baseConfig(config)
  const uq = await standardUQNodeFactory(uidConfig)
  const imprintingAddress = uq.id.getImprintingAddress()
  const orchestrateAddress = uq.id.getOrchestrateAddress()
  const nodename = uq.nodename
  const baseXpub = uq.id.getBaseXpub()
  console.log('Node Name:', nodename)
  console.log('Node Pub:', baseXpub)
  /** @type {import('../types').UIDNodeFunctions} */
  const nodeFunctions = {
    getContracts,
    requestToggleLed,
    getLedStatus,
    nodeInfo: {
      imprintingAddress,
      orchestrateAddress,
      nodename,
      baseXpub
    }
  }

  return nodeFunctions

  async function getContracts () {
    /** @type {import('@uniquid/uidcore/typings/types/data/Contract').UserContract[]} */
    const userContracts = await uq.db.getAllUserContracts()

    return userContracts
  }
  async function requestToggleLed (
    /** @type {import('@uniquid/uidcore/typings/types/data/Contract').UserContract} */ contract
  ) {
    const { providerName, userAddress } = getContractUserAddressAndProviderNameOrThrow(contract)
    const response = await uq.msgs.request(uq.id, contract.identity, userAddress, providerName, TOGGLE_LED_FN, TOGGLE_LED_PARAM)
    if (response.body.error) {
      throw response.body.error
    }
  }

  async function getLedStatus (
    /** @type {import('@uniquid/uidcore/typings/types/data/Contract').UserContract} */ contract
  ) {
    const { providerName, userAddress } = getContractUserAddressAndProviderNameOrThrow(contract)
    const response = await uq.msgs.request(uq.id, contract.identity, userAddress, providerName, READ_LED_STATUS_FN, READ_LED_STATUS_PARAM)
    if (response.body.error) {
      throw response.body.error
    }
    const result = JSON.parse(response.body.result)

    /** @type {'on' | 'off'} */
    const ledStatusString = result.led

    return ledStatusString === 'on'
  }
  function getContractUserAddressAndProviderNameOrThrow (
    /** @type {import('@uniquid/uidcore/typings/types/data/Contract').UserContract} */ contract
  ) {
    const { providerName } = contract
    if (!providerName) {
      throw 'ProviderName not available for this contract yet'
    }
    const userAddress = uq.id.identityFor(contract.identity).address
    return {
      userAddress,
      providerName
    }
  }
}

/** @returns {import('@uniquid/uidcore/typings/impl/StandardUQNodeFatcory/factory').Config} */
function baseConfig (/** @type {import('../types').UIDNodeConfig} */ config) {
  return {
    home: config.home,
    mqttHost: config.mqttUrl,
    bcSeeds: config.bcSeeds,
    registryUrl: config.registryUrl,
    requestTimeout: config.requestTimeout,
    nodenamePrefix: config.nodenamePrefix,
    announceTopic: config.mqttTopic,
    bcLogLevel: config.logLevel,
    network: config.networkNameMapping[config.network],
    rpcHandlers: []
  }
}
