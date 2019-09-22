/*eslint-disable*/
let registerWorkerPouch = require('worker-pouch/worker')
let PouchDB = require('pouchdb')

PouchDB = PouchDB.default && !PouchDB.plugin ? PouchDB.default : PouchDB
registerWorkerPouch = registerWorkerPouch.default && !registerWorkerPouch.call ? registerWorkerPouch.default : registerWorkerPouch

self.registerWorkerPouch = registerWorkerPouch
self.PouchDB = PouchDB