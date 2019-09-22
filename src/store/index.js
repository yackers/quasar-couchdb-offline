import Vue from 'vue'
import Vuex from 'vuex'

import database from './database'

Vue.use(Vuex)

export default function () {
  const Store = new Vuex.Store({
    modules: {
      database
    },
    strict: process.env.DEV
  })

  return Store
}
