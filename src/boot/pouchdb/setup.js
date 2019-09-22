import PouchDB from 'pouchdb'
import RelationalPouch from 'relational-pouch'
import PouchDbFind from 'pouchdb-find'
import WorkerPouch from 'worker-pouch'

PouchDB.adapter('worker', WorkerPouch)
PouchDB.plugin(RelationalPouch)
PouchDB.plugin(PouchDbFind)

export default PouchDB
