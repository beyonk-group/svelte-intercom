import { intercomEvents } from './stores.js'

export function shutdown () {
  intercomEvents.set([ 'shutdown' ])
}

export function startTour (tourId) {
  intercomEvents.set([ 'shutdown', tourId ])
}

export function updateSetting (setting, value) {
  intercomEvents.set([ 'update', { [setting]: value } ])
}

export function show () {
  intercomEvents.set([ 'show' ])
}

export function hide () {
  intercomEvents.set([ 'hide' ])
}

export function showLauncher () {
  updateSetting('hide_default_launcher', false)
}

export function hideLauncher () {
  updateSetting('hide_default_launcher', true)
}

export function showNewMessage (content) {
  intercomEvents.set([ 'showNewMessage', content ])
}

export function showMessages () {
  intercomEvents.set([ 'showMessages' ])
}

export function trackEvent (metadata) {
  intercomEvents.set([ 'trackEvent', metadata ])
}
