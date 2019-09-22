/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.conf > pwa > workboxPluginMode is set to "InjectManifest"
 */
/*eslint-disable*/
importScripts(`pouchdb-service-worker.js`)
workbox.core.setCacheNameDetails({prefix: "pouchdb-offline"})

self.skipWaiting()
self.__precacheManifest = [].concat(self.__precacheManifest || [])
workbox.precaching.precacheAndRoute(self.__precacheManifest, {
  "directoryIndex": "/"
})
workbox.routing.registerRoute("/", new workbox.strategies.NetworkFirst(), 'GET')
workbox.routing.registerRoute(/^http/, new workbox.strategies.NetworkFirst(), 'GET')

registerWorkerPouch(self, PouchDB)
self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim())
})