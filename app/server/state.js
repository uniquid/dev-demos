module.exports = (
  /** @type {import('../types').NodeEventBus} */ nodeBus,
  /** @type {import('../types').ClientEventBus} */ clientBus,
  /** @type {import('../types').NodeInfo} */ nodeInfo
) => {
  /** @type {import('../types').AppState} */
  let appState = {
    deviceStatuses: [],
    nodeInfo
  }

  nodeBus.on('gotContracts', (contracts) => {
    /** @type {import('../types').AppState} */
    const newAppstate = {
      ...appState,
      deviceStatuses: contracts.map((contract) => {
        /** @type {import('../types').DeviceStatus} */
        const current = appState.deviceStatuses.find(
          (dev_status) => dev_status.contract.contractor === contract.contractor
        ) || {
          ledStatusReadResponse: null,
          toggleLedResponse: null,
          requestingToggle: false,
          contract
        }

        /** @type {import('../types').DeviceStatus} */
        const newStatus = {
          ...current,
          contract
        }
        return newStatus
      })
    }
    stateChanged(newAppstate)
  })

  nodeBus.on('gotLedStatus', (ledStatusReadResponse) => {
    const newAppstate = {
      ...appState,
      deviceStatuses: appState.deviceStatuses.map((devStatus) => {
        if (devStatus.contract.contractor === ledStatusReadResponse.contract.contractor) {
          /** @type {import('../types').DeviceStatus} */
          const newStatus = {
            ...devStatus,
            ledStatusReadResponse: ledStatusReadResponse
          }
          return newStatus
        } else {
          return devStatus
        }
      })
    }
    stateChanged(newAppstate)
  })

  nodeBus.on('toggleLedResponse', (toggleLedResponse) => {
    const newAppstate = {
      ...appState,
      deviceStatuses: appState.deviceStatuses.map((devStatus) => {
        if (devStatus.contract.contractor === toggleLedResponse.contract.contractor) {
          /** @type {import('../types').DeviceStatus} */
          const newStatus = {
            ...devStatus,
            toggleLedResponse: toggleLedResponse,
            requestingToggle: false
          }
          return newStatus
        } else {
          return devStatus
        }
      })
    }
    stateChanged(newAppstate)
  })

  clientBus.on('requestToggleLed', (contract) => {
    const newAppstate = {
      ...appState,
      deviceStatuses: appState.deviceStatuses.map((devStatus) => {
        if (devStatus.contract.contractor === contract.contractor) {
          /** @type {import('../types').DeviceStatus} */
          const newStatus = {
            ...devStatus,
            requestingToggle: true
          }
          return newStatus
        } else {
          return devStatus
        }
      })
    }
    stateChanged(newAppstate)
  })

  return () => appState

  function stateChanged (/** @type {import('../types').AppState} */ newState) {
    appState = newState
    nodeBus.emit('stateChange', appState)
  }
}
