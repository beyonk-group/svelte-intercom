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

  export function startTour (tourId) {
    window[globalName]('startTour', tourId)
  }

  export function updateSettings () {
    window[settingsKey] = getSettings()
    window[globalName]('update', window[settingsKey])
  }

  onMount(() => {
    loader(
      `//widget.intercom.io/widget/${appId}`,
      () => typeof window[globalName] === 'function',
      () => {
        window[globalName]('reattach_activator')
        window[globalName]('onUnreadCountChange', dispatch.bind('unread-count-change'))

        if (autoBoot) {
          boot()
        }
      }
    )
  })
</script>