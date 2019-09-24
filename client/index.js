'use strict'

import Vue from 'vue'
import './assets/style.css'
import Index from './index.vue'

new Vue({ // eslint-disable-line
  el: '#app',

  components: {
    Index
  },

  template: '<index/>'
})
