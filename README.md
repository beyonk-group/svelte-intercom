<p align="center">
  <img width="186" height="90" src="https://user-images.githubusercontent.com/218949/44782765-377e7c80-ab80-11e8-9dd8-fce0e37c235b.png" alt="Beyonk" />
</p>

## Svelte Intercom

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com) [![svelte-v3](https://img.shields.io/badge/svelte-v3-blueviolet.svg)](https://svelte.dev) ![](https://github.com/actions/beyonk-adventures/workflows/publish/badge.svg)

Pure vanilla JS Intercom integration

## Install

```bash
$ npm install --save-dev @beyonk/svelte-intercom
```

## Usage (With Svelte)

Place the IntercomLauncher at the top level of your application (_layout.svelte for Sapper)

```html
<IntercomLauncher appId='abcde12345' />

<script>
  import { IntercomLauncher, intercom } from '@beyonk/svelte-intercom'
</script>
```

## Other configuration attributes

There are a number of configuration attributes you can pass, all but appId are optional.

List of possible options in the module:

| Option            | Default      | Required | Description                                                                                                                           |
|-------------------|--------------|----------|---------------------------------------------------------------------------------------------------------------------------------------|
| appId             | -            | true     | Your Intercom app id                                                                                                                  |

## Events

The Component emits all events emitted by the intercom module:

```html
<IntercomLauncher appId='abcde12345' on:unread-count-change={logUnreadCount} />

<script>
  import { IntercomLauncher } from '@beyonk/svelte-intercom'

  function logUnreadCount (unreadCount) {
    console.log('Unread count', unreadCount)
  }
</script>
```

List of possible events in the module:

| Event                | Description                                                                                                                             |
|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| unread-count-change  | [onUnreadCountChange](https://developers.intercom.com/installing-intercom/docs/intercom-javascript#section-intercomonunreadcountchange) |
| show                 | [onShow](https://developers.intercom.com/installing-intercom/docs/intercom-javascript#section-intercomonshow) |
| hide                 | [onHide](https://developers.intercom.com/installing-intercom/docs/intercom-javascript#section-intercomonhide) |
| ready                | Dispatched when the intercom component has finished initialising |

## Methods

The Component has all methods listed in [the intercom documentation](https://developers.intercom.com/installing-intercom/docs/intercom-javascript).

These methods are exposed by the `intercom` module. This module can be imported anywhere in your project to call methods on the Messenger.

```html
<IntercomLauncher appId='abcde12345' />

<script>
  import { IntercomLauncher, intercom } from '@beyonk/svelte-intercom'

  intercom.startTour()
</script>
```

The component implements a couple of extra convenience methods:


List of possible events in the module:

| Event                | Description       |                                                                                                                      |
|----------------------|-------------------|
| showLauncher()       | show the launcher |
| hideLauncher()       | hide the launcher |

## The underlying instance

You can access the underlying intercom instance for anything else you require:

```html
<IntercomLauncher appId='abcde12345' bind:this={intercom} />

<script>
  import { IntercomLauncher } from '@beyonk/svelte-intercom'

  const rawIntercom = intercom.getIntercom()
</script>
```

## Troubleshooting

### Q. How do I hide the launcher for specific pages?

Because of the strange way intercom's launcher hiding works, you need to add the following to your route to hide it for that specific page.

```
import { onMount, onDestroy } from 'svelte'

onMount(async () => {
  intercom.overrideBootSettings({ hide_default_launcher: true })
  intercom.hideLauncher()
})

onDestroy(intercom.showLauncher)
```

This will:
* add a boot setting for intercom to hide the launcher by default, if the page is the first page the user visits in your application.
* hide the launcher immediately for the page
* set a hook so that if the user navigates away from the page, the launcher shows again.

## Developing

In order to run the local demo you *must* pass a valid intercom app id otherwise it won't work:

```
APP_ID=<your-app-id> npm run dev
```

## License

[MIT License](./LICENSE)
