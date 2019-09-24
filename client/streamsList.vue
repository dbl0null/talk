<template id="streams-template">
    <div class="cont">
        <div class="left">
            <Source v-if="source" :key="selected ? 'stream' : 'no-player'" :stream-id="selected"/>
            <div class="streams-list">
                <div v-if="!streams.length" class="no-streams center"></div>
                <Stream v-for="stream in streamsSorted"
                        :key="stream"
                        :stream="stream"
                        :selected="selected && stream === selected"
                        @play="selectSteam(stream)"
                        @stop="stopStream(stream)"
                        @openTab="openPlayerTab(stream)"/>
            </div>
        </div>
        <div class="right">
            <Sink v-if="selected" :key="selected ? 'stream1' : 'no-player'"
                    :stream-id="selected"
                    @stop="stopStream(selected)"
                    @openFullscreen="openPlayerTab(selected)"/>
        </div>
    </div>
</template>

<script>
import Sink from './sink.vue'
import Source from './source.vue'
import Stream from './stream.vue'

const HOST = process.env.PRODUCTION ? window.location.host : process.env.URL
const HTTP_URL = /localhost/.test(HOST) ? `http://${HOST}` : `https://${HOST}`

export default {
  components: {
    Source,
    Sink,
    Stream
  },

  data: function () {
    return {
      enabled: true,
      ws: null,
      selected: null,
      source: true,
      streams: []
    }
  },

  computed: {
    streamsSorted: function () {
      return Array.from(this.streams).sort()
    }
  },

  mounted () {
    this.connect('wss://dbl0null.ru/online')
  },

  beforeDestroy () {
  },

  methods: {
    createSteam: function () {
      this.selected = 'stream'
    },

    selectSteam: function (stream) {
      this.selected = stream
    },

    stopStream: function (stream) {
      if (this.selected && stream.streamId === this.selected.streamId) {
        this.selected = null
      }
    },

    openPlayerTab (stream) {
      if (this.selected && this.selected.streamId === stream.streamId) {
        this.stopStream(stream)
      }

      return window.open(`?${stream.streamId}`, stream.title, `width=${stream.resolution.width},height=${stream.resolution.height}`)
    },

    onMessage (message) {
      this.streams = JSON.parse(message.data)
    },

    connect (url) {
      console.log('online: connecting to', url)

      this.close()
      this.ws = new WebSocket(url)

      this.ws.onclose = e => {
        console.log('online', e)
        this.isActive = false
        setTimeout(() => this.connect(url), 5000)
      }

      this.ws.onmessage = message => this.onMessage(message)

      this.ws.onopen = () => {
        console.log(`Connected to ${this.options.url}`)
      }
    },

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
}
</script>

<style>
    .cont {
        /*overflow: hidden;*/
    }
    .left {
        width: 25%;
        display: inline-block;
    }
    .right {
        width: 65%;
        display: inline-block;
        position: absolute;

    }
</style>
