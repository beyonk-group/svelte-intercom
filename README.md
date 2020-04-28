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

```html
<Messenger appId='abcde12345' />

<script>
  import { Messenger } from '@beyonk/svelte-intercom'
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
<Messenger appId='abcde12345' on:unread-count-change ={doStuff} />

<script>
  import { Messenger } from '@beyonk/svelte-intercom'

  function doStuff () {
    //...
  }
</script>
```

List of possible events in the module:

| Event                | Description                                                                                                                             |
|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| unread-count-change  | [onUnreadCountChange](https://developers.intercom.com/installing-intercom/docs/intercom-javascript#section-intercomonunreadcountchange) |
| show                 | [onShow](https://developers.intercom.com/installing-intercom/docs/intercom-javascript#section-intercomonshow) |
| hide                 | [onHide](https://developers.intercom.com/installing-intercom/docs/intercom-javascript#section-intercomonhide) |

## Methods

The Component has all methods listed in [the intercom documentation](https://developers.intercom.com/installing-intercom/docs/intercom-javascript)

```html
<Messenger appId='abcde12345' bind:this={intercom} />

<script>
  import { Messenger } from '@beyonk/svelte-intercom'

  intercom.boot()
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
<Messenger appId='abcde12345' bind:this={intercom} />

<script>
  import { Messenger } from '@beyonk/svelte-intercom'

  const rawIntercom = intercom.getIntercom()
</script>
```

## Developing

In order to run the local demo you *must* pass a valid intercom app id otherwise it won't work:

```
APP_ID=<your-app-id> npm run dev
```

## License

[MIT License](./LICENSE)
