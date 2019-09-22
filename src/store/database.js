import { factory } from '@toby.mosque/utils'
import { db } from 'src/boot/pouchdb'
const { store } = factory

const options = {
  model: class PeopleModel {
    companies = []
    jobs = []
  },
  collections: [
    { single: 'company', plural: 'companies', id: 'id' },
    { single: 'job', plural: 'jobs', id: 'id' }
  ]
}

export default store({
  options,
  actions: {
    async initialize ({ commit }) {
      let { companies } = await db.local.rel.find('company')
      let { jobs } = await db.local.rel.find('job')
      commit('companies', companies)
      commit('jobs', jobs)
    }
  }
})
