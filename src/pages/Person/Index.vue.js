import { factory, store as storeUtils, uuid } from '@toby.mosque/utils'
import { db } from 'src/boot/pouchdb'
import { mapActions } from 'vuex'
const { mapState } = storeUtils
const { page, store } = factory

const options = {
  model: class PersonModel {
    id = ''
    rev = ''
    firstName = ''
    lastName = ''
    email = ''
    job = ''
    company = ''
  }
}

const moduleName = 'person'
const storeModule = store({
  options,
  actions: {
    async initialize ({ dispatch, commit }, { route }) {
      let person = await dispatch('personById', route.params.id)
      commit('id', person.id || uuid.comb())
      commit('rev', person.rev)
      commit('firstName', person.firstName)
      commit('lastName', person.lastName)
      commit('email', person.email)
      commit('job', person.job)
      commit('company', person.company)
    },
    async personById (context, id) {
      let { people } = await db.local.rel.find('person', id)
      let person = people && people.length > 0 ? people[0] : {}
      return person
    },
    async save ({ state }) {
      let current = { ...state }
      delete current['@@']
      await db.local.rel.save('person', current)
    }
  }
})

export default page({
  name: 'PersonPage',
  options,
  storeModule,
  moduleName,
  computed: {
    ...mapState('database', ['jobs', 'companies'])
  },
  mounted () {
    if (this.rev && !this.listener) {
      this.listener = entity => {
        if (entity._deleted) {
          this.$q.dialog({
            parent: this,
            color: 'warning',
            title: 'Deleted',
            message: 'Someone deleted this person'
          }).onDismiss(() => {
            this.$router.push('/people/')
          })
        } else {
          this.$q.dialog({
            parent: this,
            color: 'warning',
            title: 'Update',
            cancel: 'No',
            ok: 'yes',
            message: 'Someone updated this person. do u wanna refresh the fields?'
          }).onOk(() => {
            this.initialize({ route: this.$route })
          }).onCancel(() => {
            this.rev = entity.rev
          })
        }
      }
      this.$root.$on(this.id, this.listener)
    }
  },
  destroyed () {
    if (this.rev && this.listener) {
      this.$root.$off(this.id, this.listener)
    }
  },
  methods: {
    ...mapActions(moduleName, { __save: 'save', initialize: 'initialize' }),
    async save () {
      try {
        await this.__save()
        this.$q.notify({
          color: 'positive',
          message: 'successfully saved'
        })
        this.$router.push('/people/')
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          message: 'failure at save'
        })
      }
    }
  }
})
