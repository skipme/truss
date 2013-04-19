/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
(function($) {

  /*
    ======== A Handy Little QUnit Reference ========
    http://docs.jquery.com/QUnit

    Test methods:
      expect(numAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      raises(block, [expected], [message])
  */

 module('set Options');
 test('once', 3, function() {
      truss_o.option('a', "1");equal(truss_o.options.a, "1");
      truss_o.option('a', undefined);equal(truss_o.options.a, '1');
      truss_o.option('a', undefined, true);equal(truss_o.options.a, undefined);
  });
  test('multi', 6, function() {
      truss_o.option('a.b.c', "1");equal(truss_o.options.a.b.c, "1");
      truss_o.option('a.b.e', "2");equal(truss_o.options.a.b.e, "2");
      truss_o.option('a', undefined);equal(JSON.stringify(truss_o.options.a), JSON.stringify({b:{c:'1',e:'2'}}));
      
      truss_o.option('a.b.c', undefined, true);equal(JSON.stringify(truss_o.options.a.b), JSON.stringify({e:'2'}));
      equal(truss_o.options.a.b.c, undefined);

      truss_o.option('a', undefined, true);equal(truss_o.options.a, undefined);
  });

  module('events', {setup:function(){}});
  test('common', 2, function() {
      var trus = truss_o.create(document.getElementById("zCanvas"));
      trus.addEventCallback("NodeAdded", function(name, index){equal(name, "1");equal(index, 2);});
      trus.invokeEvent("NodeAdded", ["1", 2]);
      trus.clearEventCallbacks("NodeAdded");
      trus.invokeEvent("NodeAdded");
  });

}(jQuery));
