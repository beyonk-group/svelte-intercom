<p align="center">
  <img width="186" height="90" src="https://user-images.githubusercontent.com/218949/44782765-377e7c80-ab80-11e8-9dd8-fce0e37c235b.png" alt="Beyonk" />
</p>

## Svelte Intercom

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com) [![svelte-v3](https://img.shields.io/badge/svelte-v3-blueviolet.svg)](https://svelte.dev)

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

The Component emits a series of events:

```html
<Messenger appId='abcde12345' on:unread-message-count={doStuff}/>

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
| unread-message-count | [onUnreadCountChange](https://developers.intercom.com/installing-intercom/docs/intercom-javascript#section-intercomonunreadcountchange) |

## Methods

The Component has a series of methods


```html
<Messenger appId='abcde12345' bind:this={intercom} />

<script>
  import { Messenger } from '@beyonk/svelte-intercom'

  intercom.boot()
</script>
```

List of possible methods in the module:


| Method            | Params             | Required | Description                                                                                                                           |
|-------------------|--------------------|----------|---------------------------------------------------------------------------------------------------------------------------------------|
| boot              | options            | false    | [boot](https://developers.intercom.com/installing-intercom/docs/intercom-javascript#section-intercomboot-intercomsettings)            |                                                                                                                 |

## License

[MIT License](./LICENSE)
