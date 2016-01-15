var mockery = require('mockery');

function registerMock(descriptor) {
  mockery.enable(descriptor.import, descriptor.mock);
}

function registerIgnoreList(ignoreList) {
  ignoreList = ignoreList || [];
  ignoreList.forEach(registerMock);
}

module.exports = function createPlugin(options) {
  options = options || {};

  return function mockeryPlugin(manager) {
    var createMixHook = manager.createMixHook;

    manager.before(function mockeryBefore() {
      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });

      registerIgnoreList(options.ignore);
    });

    mockery.after(function mockeryAfter() {
      mockery.deregisterAll();
      mockery.disable()
    });

    mockery.before(createMixHook(function (mixer) {
      return function registerHook() {
        (mixer.mocks || []).forEach(function (descriptor) {
          var mockName = descriptor.mockName;
          var importPath = descriptor.import;
          var mock = descriptor.mock({
            mockName: mockName
          });
          mixer.registerMock(mockName, mock);
          mockery.registerMock(importPath, mock);
        });
      };
    }));
  }
};
