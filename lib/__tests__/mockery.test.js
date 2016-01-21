var expect = require('expect');
var MochaMix = require('mocha-mix');
var MockeryPlugin = require('../index');

MochaMix.use(MockeryPlugin());

describe('mockery', function () {
  var TestMock = { __isTestMock: true };
  var mixer = MochaMix.mix({
    rootDir: __dirname,
    import: '../index',
    mocks: {
      TestMock: {
        import: 'test-mock',
        mock: TestMock
      }
    }
  });

  it('should have mock references as mixer field', function () {
    var actual =  mixer.mocks.TestMock;
    expect(TestMock).toBe(actual);
  });

  it('should override "require" to return TestMock', function () {
    var actual = require('test-mock');
    expect(TestMock).toBe(actual);
  });
});
