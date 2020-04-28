<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import { intercomEvents } from './stores.js'
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

  export function updateSettings () {
    window[settingsKey] = getSettings()
    window[globalName]('update', window[settingsKey])
  }

  export function getVisitorId () {
    return window[globalName]('getVisitorId')
  }

  export function getIntercom () {
    return window[globalName]
  }

  function boot (options = getSettings()) {
    window[globalName]('boot', options)
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
        dispatch('ready')
      }
    )
  })

  let unsubscribe = intercomEvents.subscribe(cmd => {
    if (!cmd) { return }
    if (!window[globalName]) {
      console.error('[svelte-intercom] called', cmd[0], 'before intercom was ready')
      return
    }
    const [ command, params ] = cmd
    window[globalName](command, params)
    intercomEvents.set()
  })

  onDestroy(unsubscribe)
</script>