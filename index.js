const midi = require('midi')
const input = new midi.input()
const config = require('rc')('launcher', {
  port: 0,
  connect: './examples/pilot',
  oscIp: '127.0.0.1',
  oscPort: 49161
})

let connect = require(config.connect)
let serviceList = connect.services()
let services = loadServices(serviceList)
connect.init(config, services, err => {
  if (err) console.log(err)
  input.on('message', (deltaTime, [channel, note, value]) => {
    connect.onMessage(config, services, channel, note, value)
  })
  input.openPort(config.port)

})

function loadServices (serviceList) {
  let services = {}
  serviceList.forEach(s => {
    if (s === 'fetch') services['fetch'] = require('node-fetch')
    if (s === 'osc') services['osc'] = require('node-osc')
  })
  return services
}
