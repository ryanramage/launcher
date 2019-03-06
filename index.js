const _ = require('lodash')
const midi = require('midi')
const config = require('rc')('launcher', {
  connectTo: ['Launchpad S', 'Launch Control XL'],
  connect: './examples/pilot',
  oscIp: '127.0.0.1',
  oscPort: 49161
})



let connect = require(config.connect)
let serviceList = connect.services()
let services = loadServices(serviceList)
connect.init(config, services, err => {
  if (err) console.log(err)
  let inputs = createInputs()
  inputs.forEach(input => {
    console.log('connecting')
    input.on('message', (deltaTime, [channel, note, value]) => {
      console.log('message', channel, note, value)
      connect.onMessage(config, services, channel, note, value)
    })
  })
})

function loadServices (serviceList) {
  let services = {}
  serviceList.forEach(s => {
    if (s === 'fetch') services['fetch'] = require('node-fetch')
    if (s === 'osc') services['osc'] = require('node-osc')
  })
  return services
}

function createInputs () {
  let inputs = []
  let input = new midi.input()
  let ports = findLaunchpadPorts(input)
  ports.forEach(port => {
    input.openPort(port)
    inputs.push(input)
    input = new midi.input()
  })
  return inputs
}

function findLaunchpadPorts (input) {
  let ports = []
  for (var i = 0; i < input.getPortCount(); i++) {
    let name = input.getPortName(i)
    console.log(name)
    if (_.includes(config.connectTo, name)) {
      console.log(name, 'on port', i)
      ports.push(i)
    }
  }
  return ports
}
