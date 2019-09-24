<template id="main-template">
    <div class="">
        <StreamsList></StreamsList>
    </div>
</template>

<script>
import StreamsList from './streamsList.vue'

export default {

  components: {
    StreamsList
  },

  data: function () {
    return {
      streamId: window.location.search.substr(1)
    }
  }
}
</script>

<style>
    section {
        max-width: 740px;
        margin: 0 auto;
        display: flex;
    }

    .column {
        margin: 10px;
        flex-grow: 1;
        flex-shrink: 1;
        flex-basis: 0;
    }

    section:nth-of-type(5) .column:first-of-type {
        flex-grow: 2;
        flex-shrink: 2;
        flex-basis: 22px;
    }

    section:nth-of-type(6) .column:nth-of-type(2) {
        flex-grow: 4;
        flex-shrink: 4;
        flex-basis: 66px;
    }

    /* OTHER STYLES */

    html, body {
        height: 100%;
        box-sizing: border-box;
        /*background-color: #383838;*/
    }

    body {
        font-family: 'Raleway', sans-serif;
        padding: 10px;
        /*background: linear-gradient(135deg, #444, #555) fixed;*/
            background-color: #383838;

    }

    .column {
        padding: 10px 0;
        background-color: rgba(255, 0, 0, 0.25);
        text-align: center;
        /*background-color: transparentize(white, 0.8);*/
        /*color: transparentize(white, 0.1);*/
    }
</style>
