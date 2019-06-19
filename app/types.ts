import { Options as CEVOpts } from '@uniquid/uidcore/typings/impl/Bcoin/BcoinCEV'
import { UserContract, ProviderName } from '@uniquid/uidcore/typings/types/data/Contract'
import { Config as StdUIDNodeConfig } from '@uniquid/uidcore//lib/impl/StandardUQNodeFatcory/factory'
export interface Config {
  pollContractsTimeout: number
  pollLedStatusTimeout: number
  port: number,
  node: BaseNodeConfig
}

export type LedStatusReadResponse = { contract: UserContract } & ({ error: string } | { ledStatus: boolean })
export type ToggleLedResponse = { contract: UserContract } & ({ error: string } | {})
export interface DeviceStatus {
  ledStatusReadResponse: null | Exclude<LedStatusReadResponse, 'contract'>
  toggleLedResponse: null | Exclude<ToggleLedResponse, 'contract'>
  requestingToggle: boolean
  contract: UserContract
}
export interface NodeInfo {
  imprintingAddress: string
  orchestrateAddress: string
  nodename: string
  baseXpub: string
}
export interface AppState {
  deviceStatuses: DeviceStatus[]
  nodeInfo: NodeInfo
}

export interface ClientEvents {
  requestToggleLed: UserContract
  getContracts: null
}
export interface NodeEvents {
  stateChange: AppState
  gotContracts: UserContract[]
  gotLedStatus: LedStatusReadResponse
  toggleLedResponse: ToggleLedResponse
}

export interface EventBus<Ev> {
  on: <T extends keyof Ev> (t: T, h: (p: Ev[T]) => unknown) => unknown
  emit: <T extends keyof Ev> (t: T, p: Ev[T]) => unknown
}

export type NodeEventBus = EventBus<NodeEvents>
export type ClientEventBus = EventBus<ClientEvents>

export interface UIDNodeFunctions {
  getContracts(): Promise<UserContract[]>
  requestToggleLed(_: UserContract): Promise<void>
  getLedStatus(_: UserContract): Promise<boolean>
  nodeInfo: NodeInfo
}
export interface CLINodeConfig {
  mqttUrl: string // "tcp://mqtt-xxx.uniquid.co:1883",
  mqttTopic: string // "xxx/announce",
  registryUrl: string // "http://xx.xxx.xx.xx:8060",
  network: string // "ltc-testnet",
  proxyUrl: string // "tcp://xx.xxx.xx.xx:8883"
}
export interface BaseNodeConfig {
  home: string
  nodenamePrefix: string
  bcSeeds: string[]
  networkNameMapping: {
    [k: string]: StdUIDNodeConfig['network']
  },
  requestTimeout: number
  logLevel: CEVOpts['logLevel']
}
export interface UIDNodeConfig extends BaseNodeConfig, CLINodeConfig {
}
export interface UIDNodeService {
  (
    nodeBus: NodeEventBus,
    clientBus: ClientEventBus,
  ): unknown
}
