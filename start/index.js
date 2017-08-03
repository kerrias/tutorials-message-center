(() => {
  'use strict';

  class App {
    load(messageCenter) {
      return Promise.resolve();
    }

    unload() {
      return Promise.resolve();
    }
  }

  module.exports = new App();
})();
