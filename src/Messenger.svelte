<script>
  import { onMount, createEventDispatcher } from 'svelte'
  import loader from '@beyonk/async-script-loader'

  export let autoBoot = true
  export let appId
  export let settings
  export const globalName = 'Intercom'
  export const settingsKey = 'intercomSettings'

  const dispatch = createEventDispatcher()

  function getSettings () {
    return Object.assign(
      {},
      settings,
      { app_id: appId }
    )
  }

  export function getIntercom () {
    return window[globalName]
  }

  export function boot (options = getSettings()) {
    window[globalName]('boot', options)
  }

  export function shutdown () {
    window[globalName]('shutdown')
  }

  export function startTour (tourId) {
    window[globalName]('startTour', tourId)
  }

  export function updateSettings () {
    window[settingsKey] = getSettings()
    window[globalName]('update', window[settingsKey])
  }

  export function updateSetting (setting, value) {
    window[globalName]('update', { [setting]: value })
  }

  export function show () {
    window[globalName]('show')
  }

  export function hide () {
    window[globalName]('hide')
  }

  export function showLauncher () {
    updateSetting('hide_default_launcher', false)
  }

  export function hideLauncher () {
    updateSetting('hide_default_launcher', true)
  }

  export function showNewMessage (content) {
    window[globalName]('showNewMessage', content)
  }

  export function showMessages () {
    window[globalName]('showMessages')
  }

  export function trackEvent (metadata) {
    window[globalName]('trackEvent', metadata)
  }

  export function getVisitorId () {
    return window[globalName]('getVisitorId')
  }

  function bindEvents () {
    const events = [
      { name: 'onHide', binding: 'hide' },
      { name: 'onShow', binding: 'show' },
      { name: 'onUnreadCountChange', binding: 'unread-count-change' }
    ]

    events.forEach(e => {
      window[globalName](e.name, dispatch.bind(e.binding))
    })
  }

  onMount(() => {
    loader(
      `//widget.intercom.io/widget/${appId}`,
      () => typeof window[globalName] === 'function',
      () => {
        window[globalName]('reattach_activator')
        bindEvents()
        if (autoBoot) {
          boot()
        }
      }
    )
  })
</script>