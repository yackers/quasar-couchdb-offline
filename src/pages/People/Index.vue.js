import { factory } from '@toby.mosque/utils'
import { db } from 'src/boot/pouchdb'
import { mapGetters, mapActions } from 'vuex'
const { page, store } = factory

const moduleName = 'people'
const options = {
  model: class PeopleModel {
    people = []
  },
  collections: [
    { single: 'person', plural: 'people', id: 'id' }
  ]
}

const storeModule = store({
  options,
  actions: {
    async initialize ({ commit }, { route }) {
      let { people } = await db.local.rel.find('person')
      commit('people', people)
    },
    async remove (context, person) {
      await db.local.rel.del('person', { id: person.id, rev: person.rev })
    }
  }
})

export default page({
  name: 'PeoplePage',
  options,
  moduleName,
  storeModule,
  mounted () {
    let self = this
    if (!this.listener) {
      this.listener = entity => {
        if (entity._deleted) {
          self.deletePerson(entity.id)
        } else {
          self.saveOrUpdatePerson(entity)
        }
      }
      this.$root.$on('person', this.listener)
    }
  },
  destroyed () {
    if (this.listener) {
      this.$root.$off('person', this.listener)
    }
  },
  data () {
    let self = this
    return {
      columns: [
        { name: 'firstName', field: 'firstName', label: 'First Name', sortable: true, required: true, align: 'left' },
        { name: 'lastName', field: 'lastName', label: 'Last Name', sortable: true, required: true, align: 'left' },
        { name: 'email', field: 'email', label: 'Email', sortable: true, required: true, align: 'left' },
        {
          name: 'job',
          label: 'Job',
          sortable: true,
          required: true,
          field (row) { return self.jobById(row.job).name },
          align: 'left'
        },
        {
          name: 'company',
          label: 'Company',
          sortable: true,
          required: true,
          field (row) { return self.companyById(row.company).name },
          align: 'left'
        },
        { name: 'actions', field: 'id', label: 'Actions', sortable: false, required: true, align: 'center' }
      ]
    }
  },
  computed: {
    ...mapGetters('database', ['jobById', 'companyById'])
  },
  methods: {
    ...mapActions(moduleName, { __remove: 'remove' }),
    remove (row) {
      this.$q.dialog({
        color: 'warning',
        title: 'Delete',
        message: `Do u wanna delete ${row.firstName} ${row.lastName}`,
        cancel: true
      }).onOk(async () => {
        try {
          await this.__remove(row)
          this.$q.notify({
            color: 'positive',
            message: 'successfully deleted'
          })
        } catch (err) {
          console.error(err)
          this.$q.notify({
            color: 'negative',
            message: 'failed at delete'
          })
        }
      })
    }
  }
})
