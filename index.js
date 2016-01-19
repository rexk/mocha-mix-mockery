var mockery = require('mockery');

function registerMock(mockDescription) {
  mockery.registerMock(mockDescription.import, mockDescription.mock);
}

function registerIgnoreList(ignoreList) {
  ignoreList = ignoreList || [];
  ignoreList.forEach(registerMock);
}

module.exports = function createPlugin(options) {
  options = options || {};

  return function mockeryPlugin(mochaMix) {
    var MixHook = mochaMix.MixHook;

    mochaMix.before(MixHook(function (mixer) {
      return function mockeryBefore() {
        mockery.enable({
          useCleanCache: true,
          warnOnReplace: false,
          warnOnUnregistered: false
        });

        registerIgnoreList(options.ignore);

        (mixer.recipe.mocks || []).forEach(function registerMixMock(mockDescription) {
          var mockName = mockDescription.mockName;
          var mock = mockDescription.mock(mockDescription);
          mixer.registerMock(mockName, mock);
          registerMock({
            import: mockDescription.import,
            mock: mock
          });
        });
      };
    }));

    mochaMix.after(MixHook(function (mixer) {
      return function mockeryAfter() {
        mixer.clearAllMocks();
        mockery.deregisterAll();
        mockery.disable();
      };
    }));
  }
};
