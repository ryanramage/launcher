exports.config = (config) => {
  // confirm the config we will need
}

exports.services = () => (['fetch', 'osc'])

exports.init = (config, services, done) => {
  services.client = new services.osc.Client(config.oscIp, config.oscPort)
  done()
}

let trackControl = 0
let muted = {}
let solo = {}

exports.onMessage = (config, services, channel, note, value) => {
  // return console.log(channel, note, value)

  let val = null
  let message = null

  // track control
  if (channel === 152 && note === 73) { trackControl = 0; return }
  if (channel === 152 && note === 74) { trackControl = 1; return }
  if (channel === 152 && note === 75) { trackControl = 2; return }
  if (channel === 152 && note === 76) { trackControl = 3; return }
  if (channel === 152 && note === 89) { trackControl = 4; return }
  if (channel === 152 && note === 90) { trackControl = 5; return }
  if (channel === 152 && note === 91) { trackControl = 6; return }
  if (channel === 152 && note === 92) { trackControl = 7; return }
  let trackCommand = null
  if (channel === 152 && note === 106) {
    trackCommand = 'MUTE'
    muted[trackControl] = !muted[trackControl]
    val = (muted[trackControl]) ? 1 : 0
  }
  if (channel === 152 && note === 107) {
    trackCommand = 'SOLO'
    solo[trackControl] = !solo[trackControl]
    val = (solo[trackControl]) ? 1 : 0
  }
  if (trackCommand) message = `C${trackControl}${trackCommand}${val}`

  // vol/pan
  if (channel === 184) {
    let val = Math.floor(interpolate(value/128, 0, 16)).toString(16).toUpperCase()
    let track = null
    if (note === 77) { track = 0, trackCommand = 'VOL' }
    if (note === 78) { track = 1, trackCommand = 'VOL' }
    if (note === 79) { track = 2, trackCommand = 'VOL' }
    if (note === 80) { track = 3, trackCommand = 'VOL' }
    if (note === 81) { track = 4, trackCommand = 'VOL' }
    if (note === 82) { track = 5, trackCommand = 'VOL' }
    if (note === 83) { track = 6, trackCommand = 'VOL' }
    if (note === 84) { track = 7, trackCommand = 'VOL' }
    if (note === 49) { track = 0, trackCommand = 'PAN' }
    if (note === 50) { track = 1, trackCommand = 'PAN' }
    if (note === 51) { track = 2, trackCommand = 'PAN' }
    if (note === 52) { track = 3, trackCommand = 'PAN' }
    if (note === 53) { track = 4, trackCommand = 'PAN' }
    if (note === 54) { track = 5, trackCommand = 'PAN' }
    if (note === 55) { track = 6, trackCommand = 'PAN' }
    if (note === 56) { track = 7, trackCommand = 'PAN' }
    if (track !== null && trackCommand !== null) message = `C${track}${trackCommand}${val}`
  }

  // first row sends
  if (channel === 184 && note >= 13 && note <= 20) {
    let send = note - 13
    let val = Math.floor(interpolate(value/128, 0, 16)).toString(16).toUpperCase()
    message = `C${trackControl}SEND${send}${val}`
  }



  // let val = Math.round(interpolate(value/128, 0, 35)).toString(36).toUpperCase()
  // let message = `C0VOL${val}`
  if (!message) return
  console.log(message)
  const oscMsg = new services.osc.Message(message)
  services.client.send(oscMsg, (err) => {
    if (err) { console.warn(err) }
  })
}

function interpolate (t, a, b) { return a * (1 - t) + b * t }
