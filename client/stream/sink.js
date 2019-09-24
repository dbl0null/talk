
class VideoSink {
  constructor (options) {
    this.options = Object.assign({
      fps: 60,
      width: 320,
      height: 180,
      canvas: document.querySelector('canvas'),
      url: 'wss://dbl0null.ru/stream/stream'
    }, options)

    this.now = performance.now()
    this.then = performance.now()
    this.elapsed = this.now - this.then
    this.fpsInterval = 1000 / this.options.fps

    this.canvas = this.options.canvas
    this.canvas.width = this.options.width
    this.canvas.height = this.options.height

    this.ctx = this.canvas.getContext('2d')
    this.imageBuf = null
    this.ws = null
    this.streamList = []
    this.connect(this.options.url)
  }

  draw () {
    if (this.imageBuf) {
      const imageData = this.ctx.createImageData(320, 240)

      imageData.data.set(this.imageBuf)
      this.ctx.putImageData(imageData, 0, 0)
      this.imageBuf = null
    }
  }

  onMessage (message) {
    this.imageBuf = new Uint8ClampedArray(message.data)
  }

  animate () {
    if (!this.isActive) {
      return
    }

    this.now = performance.now()
    this.elapsed = this.now - this.then

    if (this.elapsed > this.fpsInterval) {
      this.then = this.now - (this.elapsed % this.fpsInterval)
      this.draw()
    }

    requestAnimationFrame(() => this.animate())
  }

  connect (url) {
    console.log('sink: connecting to', url)

    this.close()
    this.ws = new WebSocket(url)
    this.ws.binaryType = 'arraybuffer'

    this.ws.onclose = e => {
      console.log('sink', e)
      this.isActive = false
      setTimeout(() => this.connect(url), 5000)
    }

    this.ws.onmessage = message => this.onMessage(message)

    this.ws.onopen = () => {
      this.isActive = true
      console.log(`Connected to ${this.options.url}`)
      requestAnimationFrame(() => this.animate())
    }
  }

  close () {
    if (this.ws) {
      this.ws.onclose = () => {}

      this.ws.onmessage = () => {}

      this.ws.close()

      this.ws = null

      delete this.ws
    }
  }
}

module.exports = VideoSink
