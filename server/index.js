const ws = require('uWebSockets.js')

const IS_SOURCE = '-source'

class Bandwidth {
  constructor () {
    this.per = 1000
    this.value = 0
    this.lasttime = null
    this.total = 0
    this.iteration = 0
    this.avg = 0
  }

  update (value) {
    const now = Date.now()

    if (this.lasttime === null) {
      this.lasttime = now
    } else {
      this.value = Math.round((value / (now - this.lasttime + 1)) * this.per)

      this.lasttime = now
      this.total += this.value

      this.avg = Math.round(this.total / ++this.iteration)
    }
  }

  static toKMG (value = 0) {
    const units = ' KMGTPEZYXWVU'

    if (value <= 0) {
      return '0'
    }

    const power = Math.min(Math.floor(Math.log(value) / Math.log(1024)), 12)
    const unit = units.charAt(power).replace(' ', '')

    return (Math.round(value * 100 / Math.pow(1024, power)) / 100) + unit
  }
}

const total = new Bandwidth()
let mainSocket = null

const talk = ws.App()

const onlineClients = new Set()
const streamClients = new Set()

talk.ws('/online', {
  compression: 0,
  maxPayloadLength: 1e6,
  idleTimeout: 0,
  open: (client, req) => onlineClients.add(client),
  close: (client, req) => onlineClients.delete(client),
  message: (source, message, isBinary) => {}
})

talk.ws('/stream/:id', {
  compression: 0,
  maxPayloadLength: 1e8,
  idleTimeout: 0,
  open: (client, req) => {
    console.log('+1', req.getUrl())

    const isSource = req.getUrl().endsWith(IS_SOURCE)

    // recommended way to store user data https://github.com/uNetworking/uWebSockets.js/issues/49
    client.isSource = isSource
    client.isActive = !isSource
    client.stream = req.getUrl().replace(IS_SOURCE, '')
    client.ip = new Uint8Array(client.getRemoteAddress()).join('.')
    client.bw = new Bandwidth()
    client.messageCount = 0

    streamClients.add(client)
  },
  message: (source, message, isBinary) => {
    const length = message.byteLength

    source.bw.update(length)
    total.update(length)

    streamClients.forEach(client => {
      if (client.stream === source.stream) {
        if (client.isActive && client.send(message, isBinary, false)) {
          client.bw.update(length)
        } else {
          client.isActive = false
        }
      }
    })
  },
  drain: client => {
    if (!client.isSource) {
      client.isActive = true
    }
  },
  close: client => {
    console.log('-1')
    streamClients.delete(client)
  }
})

const port = process.argv[2] || '10500'

process.on('SIGTERM', () => ws.us_listen_socket_close(mainSocket))

const colors = {
  Reset: '\x1b[0m',
  Dim: '\x1b[2m',
  FgRed: '\x1b[31m',
  FgGreen: '\x1b[32m',
  FgYellow: '\x1b[33m',
  FgBlue: '\x1b[34m',
  Clear: '\u001B[2J',
  Back: '\u001B[1;0f'
}

function dir () {
  streamClients.forEach(client => {
    process.stdout.write(`${Bandwidth.toKMG(client.bw.avg)} `.padStart(10))
    process.stdout.write(`${client.isSource ? colors.FgRed : colors.FgBlue}${client.stream}${colors.Reset} `.padEnd(30))
    process.stdout.write(`${client.isActive ? colors.FgBlue : colors.FgYellow}${client.ip}${colors.Reset} `.padStart(20))
    process.stdout.write(`${colors.Dim}${client.bw.iteration}${colors.Reset}`)
    process.stdout.write('\n')
  })
}

function online () {
  const streams = Array.from(streamClients)
    .filter(client => client.isSource)
    .map(client => client.stream)
  const message = JSON.stringify(streams)

  onlineClients.forEach(client => client.send(message, false, false))
  dir()
}

talk.listen('0.0.0.0', port, res => {
  process.stdout.write(colors.Clear)
  process.stdout.write(colors.Back)
  console.log(mainSocket = res ? 'listening' : 'failed', port, res)
  setInterval(online, 5000).unref()
})
