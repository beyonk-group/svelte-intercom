<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import { intercomEvents } from './stores.js'
  import { EventQueue } from './queue.js'
  import loader from '@beyonk/async-script-loader'

  export let autoBoot = true
  export let appId
  export let settings
  export const globalName = 'Intercom'
  export const settingsKey = 'intercomSettings'

  let queue

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
    queue.send('update', window[settingsKey])
  }

  export function getVisitorId () {
    return getIntercom()('getVisitorId')
  }

  export function getIntercom () {
    return window[globalName]
  }

  function boot (options = getSettings()) {
    queue.send('boot', options)
  }

  function bindEvents () {
    const events = [
      { name: 'onHide', binding: 'hide' },
      { name: 'onShow', binding: 'show' },
      { name: 'onUnreadCountChange', binding: 'unread-count-change' }
    ]

    events.forEach(e => {
      queue.send(e.name, dispatch.bind(e.binding))
    })
  }

  onMount(() => {
    loader(
      `//widget.intercom.io/widget/${appId}`,
      () => typeof window[globalName] === 'function',
      () => {
        queue = new EventQueue(window[globalName])
        window[globalName]('reattach_activator')
        bindEvents()
        if (autoBoot) {
          boot()
        }
        queue.start()
        dispatch('ready')
      }
    )
  })

  let unsubscribe = intercomEvents.subscribe(cmd => {
    if (!cmd) { return }
    const [ command, params ] = cmd
    window[globalName](command, params)
    intercomEvents.set()
  })

  onDestroy(unsubscribe)
</script>