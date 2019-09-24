<template id="streams-template">
    <div class="stream">
        <div class="stream-preview" @click="selected ? $emit('stop') : $emit('play')">
            <div v-if="selected" class="active">⏹️ {{stream}}</div>
            <div v-else class="inactive">▶️ {{stream}}</div>
        </div>
    </div>
</template>

<script>
export default {
  components: {},

  props: ['stream', 'selected'],

  beforeDestroy () {
    if (this.selected) {
      this.$emit('stop')
    }
  }
}
</script>

<style>
    .stream-preview {
        cursor: pointer;
    }
    .stream {
        color: #f1f1f1;
    }
    .active {
        color: #ff9191;
    }
    .inactive {
        /*color: red;*/
    }
</style>
