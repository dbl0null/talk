<template id="player-template">
    <div ref="playerContainer" class="source">
        <div :class="[fullscreen ? 'fullscreen': 'normal']"
             class="source-container"
             :style="playerStyle"
             @click="togglePlayer">
            <video ref="videoElement" autoplay></video>
            <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
            <div :class="[enabled ? 'online': 'offline']">{{ '•' }}</div>
        </div>
    </div>
</template>
<script>
import Source from './stream/source'

const HOST = process.env.PRODUCTION ? window.location.host : `dbl0null.host`

export default {
  props: {
    fullscreen: {
      type: Boolean,
      default: false
    }
  },

  data: function () {
    return {
      video: null,
      playerWidth: '100vw',
      playerHeight: 'calc(100vw / 1.77)',
      errorMessage: ''
    }
  },

  computed: {
    enabled: function () {
      return !this.errorMessage && this.video !== null && this.video.isActive
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

    togglePlayer: function () {
      this.enabled ? this.stopPlayer() : this.startPlayer()
    },

    stopPlayer: function () {
      if (this.video) {
        this.video.close()
        delete this.video
      }

      console.log('stopped')
    },

    startPlayer: function () {
      if (this.errorMessage) {
        return
      }

      if (!this.video) {
        try {
          this.video = new Source({ canvas: this.$refs.videoElement })
        } catch (e) {
          console.error('error creating video:', e)
        }
      }

      console.log('started:', this.video)
    }
  }
}
</script>

<style>
    .onlne {
        color: darkgreen;
    }
    .offline {
        color: darkred;
    }
    .source-container {
        width: 320px;
    }
    .source {
        width: 30%;
        height: 240px;
    }
</style>
