<template id="player-template">
    <div ref="playerContainer" class="sink">
        <div class="player-container"
             :style="playerStyle"
             @click="togglePlayer">
        <canvas v-show="enabled" ref="playerCanvas" class="player-canvas"></canvas>
        </div>
    </div>
</template>
<script>
import Sink from './stream/sink'

const HOST = process.env.PRODUCTION ? window.location.host : `dbl0null.ru`

export default {
  props: {
    streamId: {
      type: String,
      required: true
    },
    stream: {
      type: Object,
      default: undefined
    }
  },

  data: function () {
    return {
      ws: null,
      video: null,
      playerWidth: '100vw',
      playerHeight: 'calc(100vw / 1.77)',
      errorMessage: ''
    }
  },

  computed: {
    enabled: function () {
      return !this.errorMessage && this.video !== null
    },

    playerStyle: function () {
      return `width:${this.playerWidth};height:${this.playerHeight};`
    }
  },

  mounted () {
    this.resizeEventHandler()
    this.startPlayer()
  },

  created () {
    window.addEventListener('resize', this.resizeEventHandler)

    if (/Edge/.test(navigator.userAgent)) {
      this.errorMessage = 'Microsoft Edge is unsupported. Use Google Chrome'
      this.stopPlayer()
    }
  },

  beforeDestroy: function () {
    this.stopPlayer()
    window.removeEventListener('resize', this.resizeEventHandler)
  },

  methods: {
    openFullscreen: function () {
      this.stopPlayer()
      this.$emit('openFullscreen')
    },

    resizeEventHandler: function () {
      const container = this.$refs.playerContainer

      if (container.clientWidth / window.innerHeight > 1.77) {
        this.playerWidth = `${window.innerHeight * 1.77}px`
        this.playerHeight = `${window.innerHeight}px`
      } else {
        this.playerWidth = `${container.clientWidth}px`
        this.playerHeight = `${container.clientWidth / 1.77}px`
      }
    },

    connect (sharedConnection = false) {
    },

    togglePlayer: function () {
      this.enabled ? this.stopPlayer() : this.startPlayer()
    },

    stopPlayer: function () {
      if (this.video) {
        this.video.close()
        this.video = null
      }

      console.log('stopped')
    },

    startPlayer: function () {
      if (this.errorMessage) {
        return
      }

      if (!this.video) {
        try {
          this.video = new Sink({
            canvas: this.$refs.playerCanvas,
            url: `wss://${HOST}${this.streamId}`
          })
        } catch (e) {
          console.error('error creating video:', e)
        }
      }

      console.log('started:', this.video, this.audio)
    }
  }
}
</script>

<style>
    .sink {
        width: 70%;
    }
    .player-container {
        margin-left: 100px;
    }
</style>
