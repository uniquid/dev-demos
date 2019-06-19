// @ts-ignore
const opn = require('opn')

const config = require('./config')
const EventEmitter = require('events')
const nodeService = require('./nodeService')
const http = require('./http')
const state = require('./state')

let uidnodePromise
if (process.env.MOCK) {
  uidnodePromise = require('./uidNodeMock')
} else {
  if (!process.env.AWS_AGENT_CONFIG) {
    console.error('an env var "AWS_AGENT_CONFIG" must be set with CLI config')
    process.exit(1)
  }
  let parsed
  try {
    // @ts-ignore
    parsed = JSON.parse(process.env.AWS_AGENT_CONFIG)
  } catch (e) {
    console.error('invalid env var "AWS_AGENT_CONFIG":', process.env.AWS_AGENT_CONFIG)
    process.exit(1)
  }
  /** @type {import('../types').CLINodeConfig} */
  let cliConfig = parsed
  uidnodePromise = require('./uidNode')({ ...config.node, ...cliConfig })
}

uidnodePromise.then((uidnode) => {
  /** @type {import('../types').NodeEventBus} */
  const nodeBus = new EventEmitter()

  /** @type {import('../types').ClientEventBus} */
  const clientBus = new EventEmitter()
  const getState = state(nodeBus, clientBus, uidnode.nodeInfo)
  http(clientBus, nodeBus, getState, config.port)
  nodeService(uidnode, nodeBus, clientBus, getState, config.pollContractsTimeout, config.pollLedStatusTimeout)

  // opn(`http://localhost:${config.port}`)
})
