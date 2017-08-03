BITS "Message Center" Tutorial
---
This tutorial shows how to use the MessageCenter subsystem in the BITS stack.

- [Objective](#objective)
- [Before You Begin](#before-you-begin)
- [Step 1: Requests](#step-1)
- [Step 2: Add Request Listener](#step-2)
- [Step 3: Events](#step-3)
- [Step 4: Add Event Listener](#step-4)

# <a name="objective"></a> Objective
- General understanding of the MessageCenter subsystem.
- Create requests from the UI and a modules runtime.
- Create a request listener.
- Send an event.
- Listen for events.

# <a name="before-you-begin"></a> Before You Begin
You need to setup a BITS Base, and be able to communicate with a running instance. If you do not already have a BITS Base running, you can create one by downloading the source and using the development command-line. You should also have a good understanding of how modules are loaded in BITS.

# <a name="step-1"></a> Step 1: Requests
A request is an asynchronous operation that a client makes to a service. A service can be any subsystem of the BITS Base or a BITS module. A request is made by calling the `sendRequest` function on an instance of MessageCenter. The MessageCenter subsystem is responsible for routing the request to the appropriate service and returning the response to the client. The `sendRequest` function returns a `Promise` that will resolve to the service's response, or reject to the service's error. To send a request to a service, the client must know the `event` for the service's request handler. For example, if a client wanted to get the BITS Id, creating the request might look like:
``` javascript
function getBitsSystemId(messageCenter) {
  return messageCenter.sendRequest('base#System bitsId')
  .then((systemId) => {
    console.log(`BITS id is ${systemId}.`);
  })
  .catch((err) => {
    console.error('Failed to get the BITS id:', err);
  });
}
```
Add the snippet of code in the `index.js` and call the function when the `tutorials-message-center` module loads.
``` javascript
class App
  load(messageCenter) {
    return getBitsSystemId(messageCenter);
  }
  ...
```
If you run BITS Base, the BITS id should be printed to the console before the module finishes loading.
``` bash
...
BITS id is juju.
2017-05-23T20:06:01.249Z - debug: Loaded module tutorials-message-center
{ name: 'tutorials-message-center', duration: 310 }
...
```
The example above creates a request from a BITS module to a BITS Base service for the BITS id. This same request can be made from the UI. The BITS Base provides a custom element that implements the MessageCenter API and allows requests to be sent from the UI to the server. Import the base-message-center element and add it to the DOM to use it in the UI. Then make a request to get the BITS id when the module page element is ready.
``` html
<link rel="import" href="../../bower_components/polymer/polymer.html">
<link rel="import" href="../base-message-center/base-message-center.html">

<dom-module id="tutorials-message-center-app">
  <template>
    <style>
      :host {
        display: block;
      }
    </style>

    <base-message-center id="messageCenter"></base-message-center>

  </template>
  <script>
  (() => {
    'use strict';

    function getBitsSystemId(messageCenter) {
      return messageCenter.sendRequest('base#System bitsId')
      .then((systemId) => {
        console.log(`BITS id is ${systemId}.`);
      })
      .catch((err) => {
        console.error('Failed to get the BITS id:', err);
      });
    }

    Polymer({
      is: 'tutorials-message-center-app',

      ready: function() {
        const messageCenter = this.$.messageCenter;
        getBitsSystemId(messageCenter);
      }
    });
  })();
  </script>
</dom-module>
```
Now when the `tutorials-message-center` page is loaded in the UI, the developer console (the console within the browser, often accessed by pressing F12) will log the system id. A request that is made from a BITS module can be made with `metadata`. The `metadata` describes the client making the request and can be used service to adjust the response of the request. Requests made from the UI automatically add the `metadata` for the authenticated user making the request. A request may also include `data` which the service can use to handle the request. To send `data` in a request add the `data` parameter to the `sendRequest` function call. For example, a request to add a user using `null` for `metadata` could look like this:
``` javascript
function addUserBob(messageCenter) {
  const data = {
    username: 'bob',
    password: 'ManBearPigSpark'
  };
  return messageCenter.sendRequest('base#Users create', null, data)
  .then((bob) => {
    console.log(`User bob was created!`);
  });
}
```
A similar request from the UI should only include the `data` and exclude the `metadata` parameter.
``` javascript
function addUserBobFromUI(messageCenter) {
  const data = {
    username: 'bob',
    password: 'ManBearPigSpark'
  };
  return messageCenter.sendRequest('base#Users create', data)
  .then((bob) => {
    console.log(`User bob was created!`);
  });
}
```

# <a name="step-2"></a> Step 2: Add Request Listener
A request is handled by a request listener. A BITS module can add request listeners by calling the `addRequestListener` function on an instance of MessageCenter. When adding a request listener the module must specify the `event`, the `metadata`, and the `listener`. The `event` is the name of the request the `listener` will handle. The `metadata` defines access controls for the request. The `listener` is the function that is called when a request is made. The `listener` function is called with request `metadata` as the first parameter. For example, this a simple request listener for providing a list of cats:
``` javascript
const cats = [
  {type: 'Somali', name: 'Moe', age: 9}
];
function CatList(metadata) {
  return Promise.resolve(cats);
}
```
Now add the request listener by calling `addRequestListener`.
``` javascript
class App
  load(messageCenter) {
    return getBitsSystemId(messageCenter)
    .then(() => messageCenter.addRequestListener('tutorial-message-center#Cat list', {scopes: ['public']}, CatList));
  }
  ...
```
Now that the request listener is registered, a client can make the request to the service. Add code to the `tutorial-message-center` module's page element to make the `tutorial-message-center#Cat list` request.
``` html
  <script>
  (() => {
    'use strict';

    function getBitsSystemId(messageCenter) {
      return messageCenter.sendRequest('base#System bitsId')
      .then((systemId) => {
        console.log(`BITS system id is ${systemId}.`);
      })
      .catch((err) => {
        console.error('Failed to get the BITS system id:', err);
      });
    }

    function getCatList(messageCenter) {
      return messageCenter.sendRequest('tutorials-message-center#Cat list')
      .then((cats) => {
        console.log(`Got ${cats.length} cat(s).`);
      })
      .catch((err) => {
        console.error('Failed to get the cat list:', err);
      });
    }

    Polymer({
      is: 'tutorials-message-center-app',

      ready: function() {
        const messageCenter = this.$.messageCenter;
        getBitsSystemId(messageCenter);
        getCatList(messageCenter);
      }
    });
  })();
  </script>
```
When a client makes a request with `data` the request listener will received the `data` as a parameter after the `metadata` parameter. For example, a request listener for creating a cat object may look like this:
``` javascript
function CatCreate(metadata, data) {
  cats.push(data);
  return Promise.resolve();
}
```
It is important to remove a request listener when a service is no longer able to handle requests. This typically occurrs when a service or module is unloaded. To remove a request listener call the `removeRequestListener` function on an instance of MessageCenter. For example, removing the request listener for listing and creating a cat when the module unloads may look like this:
``` javascript
class App {

  unload() {
    return Promise.resolve()
    .then(() => this._messageCenter.removeRequestListener('tutorials-message-center#Cat list', CatList))
    .then(() => this._messageCenter.removeRequestListener('tutorials-message-center#Cat create', CatCreate));
  }
}
```
This pattern of adding/removing request listeners when a module or service is loaded/unloaded is used often. The BITS Base provides a class named Messenger to handle the tracking of added and removed request listeners. The cat request listeners can be re-written to use the Messenger class like this:
``` javascript
class App {
  constructor() {
    this._messenger = new global.helper.Messenger();
    this._messenger.addRequestListener('tutorials-message-center#Cat list', {scopes: ['public']}, CatList);
    this._messenger.addRequestListener('tutorials-message-center#Cat create', {scopes: ['public']}, CatCreate);
  }

  load(messageCenter) {
    return getBitsSystemId(messageCenter)
    .then(() => this._messenger.load(messageCenter));
  }

  unload() {
    return Promise.resolve()
    .then(() => this._messenger.unload());
  }
}
```

# <a name="step-3"></a> Step 3: Events
The service can also send unsolicited events to clients that register to listen. A service sends an event by calling the `sendEvent` function on an instance of MessageCenter. The `sendEvent` function takes an `event`, `metadata`, and `data` parameters. For example, this is an example of sending an event when module is loaded:
``` javascript
load(messageCenter) {
  return getBitsSystemId(messageCenter)
  .then(() => this._messenger.load(messageCenter))
  .then(() => messageCenter.sendEvent('tutorials-message-center#App', {scopes: ['public']}, {type: 'loaded'}));
}
```

# <a name="step-4"></a> Step 4: Add Event Listener
A client can listen for an event by adding an event listener. An event listener an be added by calling the `addEventListener` function on an instance of MessageCenter. For example, a module can listen for the event that is sent when the BITS Base is initialized:
``` javascript
function onInitialized() {
  console.log('Base is initialized');
}

class App {
  ...

  load(messageCenter) {
    ...
    .then(() => messageCenter.addEventListener('base#Base initialized', {scopes: null}, onInitialized));
  }

  unload() {
    return Promise.resolve()
    .then(() => messageCenter.removeEventListener('base#Base initialized', onInitialized))
    ...
  }
}
```
The UI can also add event listeners by using the `addSocketEventListener` function on the MessageCenter custom element.  Note the difference in function names between the client and server side.  If adding an Event Listener from the server side, you can call the `addEventListener` function on the message center, but to do the same thing on the client side, you must call the `addSocketEventListener` function on the message center.
``` html
<script>
(() => {
  'use strict';
  ...

  function onInitialized() {
    console.log('Base is initialized');
  }

  function addBaseInitializedListener(messageCenter) {
    return messageCenter.addSocketEventListener('base#Base initialized', onInitialized);
  }

  Polymer({
    is: 'tutorials-message-center-app',

    ready: function() {
      const messageCenter = this.$.messageCenter;
      getBitsSystemId(messageCenter);
      getCatList(messageCenter);
      addBaseInitializedListener(messageCenter);
    }
  });
})();
</script>
```
