function uuidv4 () {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

class VideoSource {
  constructor (options) {
    this.streamId = localStorage.getItem('localStreamId') || uuidv4()
    localStorage.setItem('localStreamId', this.streamId)

    this.options = Object.assign({
      fps: 5,
      width: 320,
      height: 180,
      video: document.querySelector('video'),
      url: `wss://dbl0null.ru/stream/${this.streamId}-source`
    }, options)

    this.videoOptions = {
      video: {
        width: this.options.width,
        height: this.options.height
      }
    }
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.options.width
    this.canvas.height = this.options.height

    this.ctx = this.canvas.getContext('2d')
    this.ws = null
    this.isActive = false

    this.now = performance.now()
    this.then = performance.now()
    this.elapsed = this.now - this.then
    this.fpsInterval = 1000 / this.options.fps

    navigator.mediaDevices.getUserMedia(this.videoOptions).then(stream => {
      this.connect(this.options.url)
      this.options.video.srcObject = stream
    })
  }

  draw () {
    this.ctx.drawImage(this.options.video, 0, 0, this.options.width, this.options.height)

    const imageData = this.ctx.getImageData(0, 0, this.options.width, this.options.height)

    if (this.isActive && this.ws && this.ws.OPEN) {
      try {
        this.ws.send(imageData.data)
      } catch (e) {
        console.log(e.message)
      }
    }
  }

  onMessage (message) {
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
    console.log('source: connecting to', url)

    this.close()
    this.ws = new WebSocket(url)
    this.ws.binaryType = 'arraybuffer'

    this.ws.onclose = e => {
      console.log('source', e)
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

module.exports = VideoSource
