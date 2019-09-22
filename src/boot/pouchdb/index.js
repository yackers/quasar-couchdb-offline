// import something here
import create from './create'
import seed from './seed'

class Database {
  local = void 0
  remote = void 0
  syncHandler = void 0
  async configure ({ isSSR, onChange }) {
    if (isSSR) {
      this.local = create('http://localhost:5984/master/')
      await seed(this.local)
    } else {
      if ('serviceWorker' in navigator) {
        if (!navigator.serviceWorker.controller) {
          await new Promise(resolve => {
            navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true })
          })
        }
        this.local = create('db', {
          adapter: 'worker',
          worker () {
            return navigator.serviceWorker
          }
        })
      } else {
        this.local = create('db', { adapter: 'worker' })
      }
      this.remote = create(`${location.protocol}//${location.host}/db/master/`)
      if (navigator.onLine) {
        try {
          await this.replicate({ source: this.remote, target: this.local })
          await this.replicate({ source: this.local, target: this.remote })
        } catch (err) {

        }
      }
      this.syncHandler = this.local.sync(this.remote, {
        live: true,
        retry: true
      })
      this.local.changes({
        since: 'now',
        live: true,
        include_docs: true
      }).on('change', onChange)
    }
  }
  async replicate ({ source, target }) {
    return new Promise((resolve, reject) => {
      source.replicate.to(target).on('complete', resolve).on('error', reject)
    })
  }
}

let events = {
  job: { name: 'job', delete: 'database/deleteJob', save: 'database/saveOrUpdateJob' },
  company: { name: 'company', delete: 'database/deleteCompany', save: 'database/saveOrUpdateCompany' }
}

const db = new Database()
export default async ({ Vue, store, router, ssrContext }) => {
  await db.configure({
    isSSR: !!ssrContext,
    onChange (change) {
      let { data, _id, _rev, _deleted } = change.doc
      let parsed = db.local.rel.parseDocID(_id)
      let event = events[parsed.type]

      if (_deleted) {
        router.app.$emit(parsed.type, { id: parsed.id, _deleted })
        router.app.$emit(parsed.id, { _deleted })
        if (event) {
          store.dispatch(event.delete, parsed.id)
        }
      } else {
        data.id = parsed.id
        data.rev = _rev
        router.app.$emit(parsed.type, data)
        router.app.$emit(parsed.id, data)
        if (event) {
          store.dispatch(event.save, data)
        }
      }
    }
  })
  await store.dispatch('database/initialize')
  Vue.prototype.$db = db
}

export { db }
