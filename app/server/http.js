// @ts-check
const express = require('express')
const app = express()
const Http = require('http')
const socket_io = require('socket.io')

module.exports = function (
  /** @type {import('../types').ClientEventBus} */ clientBus,
  /** @type {import('../types').NodeEventBus} */ nodeBus,
  /** @type {()=>import('../types').AppState} */ getState,
  /** @type {number} */ port
) {
  const http = new Http.Server(app)
  var io = socket_io(http)
  app.use(express.static('../html-ui'))

  http.listen(port, function () {
    console.log(`listening on *:${port}`)
  })
  /** @type {(keyof import('../types').NodeEvents)[]} */
  const nodeEvents = ['stateChange', 'gotContracts', 'gotLedStatus', 'toggleLedResponse']
  nodeEvents.forEach((eventName) => {
    // @ts-ignore
    nodeBus.on(eventName, (payload) => io.emit(eventName, payload))
  })

  io.on('connection', function (socket) {
    socket.emit('stateChange', getState())
    /** @type {(keyof import('../types').ClientEvents)[]} */
    const clientEvents = ['requestToggleLed', 'getContracts']
    clientEvents.forEach((eventName) => {
      socket.on(eventName, (payload) => {
        clientBus.emit(eventName, payload)
      })
    })
    socket.on('disconnect', () => {
      socket.removeAllListeners()
    })
  })
}
