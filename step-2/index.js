/**
Copyright 2017 LGS Innovations

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
**/
(() => {
  'use strict';

  const Messenger = global.helper.Messenger;

  function getBitsSystemId(messageCenter) {
    return messageCenter.sendRequest('base#System bitsId')
    .then((systemId) => {
      console.log(`BITS id is ${systemId}.`);
    })
    .catch((err) => {
      console.error('Failed to get the BITS system id:', err);
    });
  }

  const cats = [
    {type: 'Somali', name: 'Moe', age: 9}
  ];

  function CatList(metadata) {
    return Promise.resolve(cats);
  }

  function CatCreate(metadata, data) {
    cats.push(data);
    return Promise.resolve();
  }

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

  module.exports = new App();
})();
