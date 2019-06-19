/// <reference types="bootstrap"/>
function rowTemplate (/** @type {import("../../types").DeviceStatus} */ dev) {
  var providerName = dev.contract.providerName || 'N/A'
  var contractInfo =
    'Payload: <strong>' +
    dev.contract.payload
      .map(function (_) {
        var hex = _.toString(16)
        hex = hex.length % 2 ? '0' + hex : hex
        return hex.toUpperCase()
      })
      .join('') +
    '</strong>' +
    ' - ' +
    '<span class="badge badge-' +
    (dev.contract.revoked ? 'warning' : 'success') +
    '">' +
    (dev.contract.revoked ? 'revoked' : 'active') +
    '</span>'
  var maybeSpinner = dev.requestingToggle
    ? '<div class="spinner-border spinner-border-sm text-danger float-right" role="status"></div>'
    : ''
  var ledString = !dev.ledStatusReadResponse
    ? '?'
    : 'error' in dev.ledStatusReadResponse
      ? '!'
      : dev.ledStatusReadResponse.ledStatus
        ? 'on'
        : 'off'
  var ledClass = !dev.ledStatusReadResponse
    ? 'secondary'
    : 'error' in dev.ledStatusReadResponse
      ? 'danger'
      : dev.ledStatusReadResponse.ledStatus
        ? 'success'
        : 'dark'

  /* prettier-ignore */
  var htmlString =
    '<div class="row">' +
    // contract card
    '  <div class="card col-8" >' +
    '    <div class="card-body">' +
    '      <h5 class="card-title">Provider Name: <strong>' + providerName + '</strong></h5>' +
    '      <h6 class="card-subtitle mb-2 text-muted"> Provider Address: <strong>' + dev.contract.contractor + '</strong></h6>' +
    '      <h6 class="card-subtitle mb-2 text-muted">' + contractInfo + '</h6>' +
    '      <div class="row">' +
    '        <div class="col-2"><span>Led:</span><div style="border-radius: 50%;behavior: url(PIE.htc);width: 30px;height: 30px;" class="bg-' + ledClass + ' text-white text-center">' + ledString + '</div></div>' +
    '        <button type="button" ' +
    (dev.requestingToggle ? 'disabled' : '') +
    '                        class="btn btn-outline-primary col-4 offset-6">' +
    '         Toggle Led' +
    maybeSpinner +
    '        </button>' +
    '      </div>' +
    '    </div>' +
    '  </div>' +
    // LedStatus Card
    '  <div class="card col-4" >' +
    '    <div class="card-body">' +
    '      <h5 class="card-title">Status</h5>' +
    '      <p class="card-text"><span style="cursor:help" name="led-status-read-response" class="badge badge-' + (!dev.ledStatusReadResponse ? 'secondary' : 'error' in dev.ledStatusReadResponse ? 'danger' : 'success') + '">Led Status Read</span></p>' +
    '      <p class="card-text"><span style="cursor:help" name="led-toggle-response" class="badge badge-' + (!dev.toggleLedResponse ? 'secondary' : 'error' in dev.toggleLedResponse ? 'danger' : 'success') + '">Toggle Led Request</span></p>' +
    '    </div>' +
    '  </div>' +
    '</div>'

  var $el = jQuery(htmlString)
  $el.find('button:not([disabled])').on('click', function (_) {
    clientBus.emit('requestToggleLed', dev.contract)
  })

  $el.find('[name=led-status-read-response]').popover({
    title: 'Last Led Read Response',
    trigger: 'hover',
    content: !dev.ledStatusReadResponse
      ? 'Requesting first time ...'
      : 'error' in dev.ledStatusReadResponse
        ? 'Error:' + dev.ledStatusReadResponse.error
        : 'Ok',
    container: $el.get(0)
  })
  $el.find('[name=led-toggle-response]').popover({
    title: 'Last Toggle Led Response',
    trigger: 'hover',
    content: !dev.toggleLedResponse
      ? 'Not requested yet, try push "Toggle Led" button'
      : 'error' in dev.toggleLedResponse
        ? 'Error:' + dev.toggleLedResponse.error
        : 'Ok',
    container: $el.get(0)
  })
  return $el
}

function toggleRequestDoneToast (/** @type {import("../../types").ToggleLedResponse} */ toggleLedResponse) {
  var status = 'error' in toggleLedResponse ? 'Error: ' + toggleLedResponse.error : 'Ok'
  /* prettier-ignore */
  var htmlString =
  '<div role="alert" aria-live="assertive" aria-atomic="true" class="toast" data-autohide="true" data-delay="3000">' +
  '  <div class="toast-header ' + ('error' in toggleLedResponse ? 'toast-header-warning' : '') + '">' +
  '    <div class="rounded mr-2" ></div>' +
  '    <strong class="mr-auto">' +
  '      Request Toggle done<br/>' +
  '    </strong>' +
  '  </div>' +
  '  <div class="toast-body">' +
  '    <span class="mr-auto">On device :<strong>' + toggleLedResponse.contract.providerName + '[' + toggleLedResponse.contract.contractor + ']</strong>.</span>' +
  '    <br/>' +
  '    <span class="mr-auto">Request Statuses :<strong>' + status + '</strong>.</span>' +
  '  </div>' +
  '</div>'

  var $el = jQuery(htmlString)
  $el.toast('show')
  return $el
}
