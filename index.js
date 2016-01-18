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

    mochaMix.before(function mockeryBefore() {
      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });
    });

    mochaMix.beforeEach(MixHook(function (mixer) {
      return function registerHook() {
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

    mochaMix.afterEach(MixHook(function (mixer) {
      return function mockeryAfterEach() {
        mixer.clearAllMocks();
        mockery.deregisterAll();
      };
    }));

    mochaMix.after(function mockeryAfter() {
      mockery.disable()
    });
  }
};
