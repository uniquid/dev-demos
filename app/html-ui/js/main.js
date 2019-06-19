jQuery.ready.then(function () {
  var $list = jQuery('#list')
  var $toastContainer = jQuery('#toasts')
  nodeBus.on('stateChange', function (state) {
    /** @type {(keyof import('../../types').NodeInfo)[]} */
    const nodeProps = ['imprintingAddress', 'orchestrateAddress', 'nodename', 'baseXpub']
    nodeProps.forEach(function (prop) {
      jQuery('#' + prop).text(state.nodeInfo[prop])
    })
    var rowsElements = state.deviceStatuses.map(rowTemplate)
    $list.empty().append(rowsElements)
  })
  nodeBus.on('toggleLedResponse', function (toggleLedResponse) {
    var $toast = toggleRequestDoneToast(toggleLedResponse)
    $toastContainer.append($toast)
  })
})
