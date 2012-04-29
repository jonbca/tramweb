/*!
  * =============================================================
  * Ender: open module JavaScript framework (https://ender.no.de)
  * Build: ender build jeesh underscore backbone d3
  * =============================================================
  */

/*!
  * Ender: open module JavaScript framework (client-lib)
  * copyright Dustin Diaz & Jacob Thornton 2011-2012 (@ded @fat)
  * http://ender.no.de
  * License MIT
  */
(function (context) {

  // a global object for node.js module compatiblity
  // ============================================

  context['global'] = context

  // Implements simple module system
  // losely based on CommonJS Modules spec v1.1.1
  // ============================================

  var modules = {}
    , old = context['$']
    , oldRequire = context['require']
    , oldProvide = context['provide']

  function require (identifier) {
    // modules can be required from ender's build system, or found on the window
    var module = modules['$' + identifier] || window[identifier]
    if (!module) throw new Error("Ender Error: Requested module '" + identifier + "' has not been defined.")
    return module
  }

  function provide (name, what) {
    return (modules['$' + name] = what)
  }

  context['provide'] = provide
  context['require'] = require

  function aug(o, o2) {
    for (var k in o2) k != 'noConflict' && k != '_VERSION' && (o[k] = o2[k])
    return o
  }

  /**
   * main Ender return object
   * @constructor
   * @param {Array|Node|string} s a CSS selector or DOM node(s)
   * @param {Array.|Node} r a root node(s)
   */
  function Ender(s, r) {
    var elements
      , i

    this.selector = s
    // string || node || nodelist || window
    if (typeof s == 'undefined') {
      elements = []
      this.selector = ''
    } else if (typeof s == 'string' || s.nodeName || (s.length && 'item' in s) || s == window) {
      elements = ender._select(s, r)
    } else {
      elements = isFinite(s.length) ? s : [s]
    }
    this.length = elements.length
    for (i = this.length; i--;) this[i] = elements[i]
  }

  /**
   * @param {function(el, i, inst)} fn
   * @param {Object} opt_scope
   * @returns {Ender}
   */
  Ender.prototype['forEach'] = function (fn, opt_scope) {
    var i, l
    // opt out of native forEach so we can intentionally call our own scope
    // defaulting to the current item and be able to return self
    for (i = 0, l = this.length; i < l; ++i) i in this && fn.call(opt_scope || this[i], this[i], i, this)
    // return self for chaining
    return this
  }

  Ender.prototype.$ = ender // handy reference to self


  function ender(s, r) {
    return new Ender(s, r)
  }

  ender['_VERSION'] = '0.4.3-dev'

  ender.fn = Ender.prototype // for easy compat to jQuery plugins

  ender.ender = function (o, chain) {
    aug(chain ? Ender.prototype : ender, o)
  }

  ender._select = function (s, r) {
    if (typeof s == 'string') return (r || document).querySelectorAll(s)
    if (s.nodeName) return [s]
    return s
  }


  // use callback to receive Ender's require & provide
  ender.noConflict = function (callback) {
    context['$'] = old
    if (callback) {
      context['provide'] = oldProvide
      context['require'] = oldRequire
      callback(require, provide, this)
    }
    return this
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = ender
  // use subscript notation as extern for Closure compilation
  context['ender'] = context['$'] = context['ender'] || ender

}(this));


(function () {

  var module = { exports: {} }, exports = module.exports;

  //     Underscore.js 1.3.3
  //     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
  //     Underscore is freely distributable under the MIT license.
  //     Portions of Underscore are inspired or borrowed from Prototype,
  //     Oliver Steele's Functional, and John Resig's Micro-Templating.
  //     For all details and documentation:
  //     http://documentcloud.github.com/underscore
  
  (function() {
  
    // Baseline setup
    // --------------
  
    // Establish the root object, `window` in the browser, or `global` on the server.
    var root = this;
  
    // Save the previous value of the `_` variable.
    var previousUnderscore = root._;
  
    // Establish the object that gets returned to break out of a loop iteration.
    var breaker = {};
  
    // Save bytes in the minified (but not gzipped) version:
    var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
  
    // Create quick reference variables for speed access to core prototypes.
    var slice            = ArrayProto.slice,
        unshift          = ArrayProto.unshift,
        toString         = ObjProto.toString,
        hasOwnProperty   = ObjProto.hasOwnProperty;
  
    // All **ECMAScript 5** native function implementations that we hope to use
    // are declared here.
    var
      nativeForEach      = ArrayProto.forEach,
      nativeMap          = ArrayProto.map,
      nativeReduce       = ArrayProto.reduce,
      nativeReduceRight  = ArrayProto.reduceRight,
      nativeFilter       = ArrayProto.filter,
      nativeEvery        = ArrayProto.every,
      nativeSome         = ArrayProto.some,
      nativeIndexOf      = ArrayProto.indexOf,
      nativeLastIndexOf  = ArrayProto.lastIndexOf,
      nativeIsArray      = Array.isArray,
      nativeKeys         = Object.keys,
      nativeBind         = FuncProto.bind;
  
    // Create a safe reference to the Underscore object for use below.
    var _ = function(obj) { return new wrapper(obj); };
  
    // Export the Underscore object for **Node.js**, with
    // backwards-compatibility for the old `require()` API. If we're in
    // the browser, add `_` as a global object via a string identifier,
    // for Closure Compiler "advanced" mode.
    if (typeof exports !== 'undefined') {
      if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = _;
      }
      exports._ = _;
    } else {
      root['_'] = _;
    }
  
    // Current version.
    _.VERSION = '1.3.3';
  
    // Collection Functions
    // --------------------
  
    // The cornerstone, an `each` implementation, aka `forEach`.
    // Handles objects with the built-in `forEach`, arrays, and raw objects.
    // Delegates to **ECMAScript 5**'s native `forEach` if available.
    var each = _.each = _.forEach = function(obj, iterator, context) {
      if (obj == null) return;
      if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
      } else if (obj.length === +obj.length) {
        for (var i = 0, l = obj.length; i < l; i++) {
          if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
        }
      } else {
        for (var key in obj) {
          if (_.has(obj, key)) {
            if (iterator.call(context, obj[key], key, obj) === breaker) return;
          }
        }
      }
    };
  
    // Return the results of applying the iterator to each element.
    // Delegates to **ECMAScript 5**'s native `map` if available.
    _.map = _.collect = function(obj, iterator, context) {
      var results = [];
      if (obj == null) return results;
      if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
      each(obj, function(value, index, list) {
        results[results.length] = iterator.call(context, value, index, list);
      });
      if (obj.length === +obj.length) results.length = obj.length;
      return results;
    };
  
    // **Reduce** builds up a single result from a list of values, aka `inject`,
    // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
    _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
      var initial = arguments.length > 2;
      if (obj == null) obj = [];
      if (nativeReduce && obj.reduce === nativeReduce) {
        if (context) iterator = _.bind(iterator, context);
        return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
      }
      each(obj, function(value, index, list) {
        if (!initial) {
          memo = value;
          initial = true;
        } else {
          memo = iterator.call(context, memo, value, index, list);
        }
      });
      if (!initial) throw new TypeError('Reduce of empty array with no initial value');
      return memo;
    };
  
    // The right-associative version of reduce, also known as `foldr`.
    // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
    _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
      var initial = arguments.length > 2;
      if (obj == null) obj = [];
      if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
        if (context) iterator = _.bind(iterator, context);
        return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
      }
      var reversed = _.toArray(obj).reverse();
      if (context && !initial) iterator = _.bind(iterator, context);
      return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);
    };
  
    // Return the first value which passes a truth test. Aliased as `detect`.
    _.find = _.detect = function(obj, iterator, context) {
      var result;
      any(obj, function(value, index, list) {
        if (iterator.call(context, value, index, list)) {
          result = value;
          return true;
        }
      });
      return result;
    };
  
    // Return all the elements that pass a truth test.
    // Delegates to **ECMAScript 5**'s native `filter` if available.
    // Aliased as `select`.
    _.filter = _.select = function(obj, iterator, context) {
      var results = [];
      if (obj == null) return results;
      if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
      each(obj, function(value, index, list) {
        if (iterator.call(context, value, index, list)) results[results.length] = value;
      });
      return results;
    };
  
    // Return all the elements for which a truth test fails.
    _.reject = function(obj, iterator, context) {
      var results = [];
      if (obj == null) return results;
      each(obj, function(value, index, list) {
        if (!iterator.call(context, value, index, list)) results[results.length] = value;
      });
      return results;
    };
  
    // Determine whether all of the elements match a truth test.
    // Delegates to **ECMAScript 5**'s native `every` if available.
    // Aliased as `all`.
    _.every = _.all = function(obj, iterator, context) {
      var result = true;
      if (obj == null) return result;
      if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
      each(obj, function(value, index, list) {
        if (!(result = result && iterator.call(context, value, index, list))) return breaker;
      });
      return !!result;
    };
  
    // Determine if at least one element in the object matches a truth test.
    // Delegates to **ECMAScript 5**'s native `some` if available.
    // Aliased as `any`.
    var any = _.some = _.any = function(obj, iterator, context) {
      iterator || (iterator = _.identity);
      var result = false;
      if (obj == null) return result;
      if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
      each(obj, function(value, index, list) {
        if (result || (result = iterator.call(context, value, index, list))) return breaker;
      });
      return !!result;
    };
  
    // Determine if a given value is included in the array or object using `===`.
    // Aliased as `contains`.
    _.include = _.contains = function(obj, target) {
      var found = false;
      if (obj == null) return found;
      if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
      found = any(obj, function(value) {
        return value === target;
      });
      return found;
    };
  
    // Invoke a method (with arguments) on every item in a collection.
    _.invoke = function(obj, method) {
      var args = slice.call(arguments, 2);
      return _.map(obj, function(value) {
        return (_.isFunction(method) ? method || value : value[method]).apply(value, args);
      });
    };
  
    // Convenience version of a common use case of `map`: fetching a property.
    _.pluck = function(obj, key) {
      return _.map(obj, function(value){ return value[key]; });
    };
  
    // Return the maximum element or (element-based computation).
    _.max = function(obj, iterator, context) {
      if (!iterator && _.isArray(obj) && obj[0] === +obj[0]) return Math.max.apply(Math, obj);
      if (!iterator && _.isEmpty(obj)) return -Infinity;
      var result = {computed : -Infinity};
      each(obj, function(value, index, list) {
        var computed = iterator ? iterator.call(context, value, index, list) : value;
        computed >= result.computed && (result = {value : value, computed : computed});
      });
      return result.value;
    };
  
    // Return the minimum element (or element-based computation).
    _.min = function(obj, iterator, context) {
      if (!iterator && _.isArray(obj) && obj[0] === +obj[0]) return Math.min.apply(Math, obj);
      if (!iterator && _.isEmpty(obj)) return Infinity;
      var result = {computed : Infinity};
      each(obj, function(value, index, list) {
        var computed = iterator ? iterator.call(context, value, index, list) : value;
        computed < result.computed && (result = {value : value, computed : computed});
      });
      return result.value;
    };
  
    // Shuffle an array.
    _.shuffle = function(obj) {
      var shuffled = [], rand;
      each(obj, function(value, index, list) {
        rand = Math.floor(Math.random() * (index + 1));
        shuffled[index] = shuffled[rand];
        shuffled[rand] = value;
      });
      return shuffled;
    };
  
    // Sort the object's values by a criterion produced by an iterator.
    _.sortBy = function(obj, val, context) {
      var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
      return _.pluck(_.map(obj, function(value, index, list) {
        return {
          value : value,
          criteria : iterator.call(context, value, index, list)
        };
      }).sort(function(left, right) {
        var a = left.criteria, b = right.criteria;
        if (a === void 0) return 1;
        if (b === void 0) return -1;
        return a < b ? -1 : a > b ? 1 : 0;
      }), 'value');
    };
  
    // Groups the object's values by a criterion. Pass either a string attribute
    // to group by, or a function that returns the criterion.
    _.groupBy = function(obj, val) {
      var result = {};
      var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
      each(obj, function(value, index) {
        var key = iterator(value, index);
        (result[key] || (result[key] = [])).push(value);
      });
      return result;
    };
  
    // Use a comparator function to figure out at what index an object should
    // be inserted so as to maintain order. Uses binary search.
    _.sortedIndex = function(array, obj, iterator) {
      iterator || (iterator = _.identity);
      var low = 0, high = array.length;
      while (low < high) {
        var mid = (low + high) >> 1;
        iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
      }
      return low;
    };
  
    // Safely convert anything iterable into a real, live array.
    _.toArray = function(obj) {
      if (!obj)                                     return [];
      if (_.isArray(obj))                           return slice.call(obj);
      if (_.isArguments(obj))                       return slice.call(obj);
      if (obj.toArray && _.isFunction(obj.toArray)) return obj.toArray();
      return _.values(obj);
    };
  
    // Return the number of elements in an object.
    _.size = function(obj) {
      return _.isArray(obj) ? obj.length : _.keys(obj).length;
    };
  
    // Array Functions
    // ---------------
  
    // Get the first element of an array. Passing **n** will return the first N
    // values in the array. Aliased as `head` and `take`. The **guard** check
    // allows it to work with `_.map`.
    _.first = _.head = _.take = function(array, n, guard) {
      return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
    };
  
    // Returns everything but the last entry of the array. Especcialy useful on
    // the arguments object. Passing **n** will return all the values in
    // the array, excluding the last N. The **guard** check allows it to work with
    // `_.map`.
    _.initial = function(array, n, guard) {
      return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
    };
  
    // Get the last element of an array. Passing **n** will return the last N
    // values in the array. The **guard** check allows it to work with `_.map`.
    _.last = function(array, n, guard) {
      if ((n != null) && !guard) {
        return slice.call(array, Math.max(array.length - n, 0));
      } else {
        return array[array.length - 1];
      }
    };
  
    // Returns everything but the first entry of the array. Aliased as `tail`.
    // Especially useful on the arguments object. Passing an **index** will return
    // the rest of the values in the array from that index onward. The **guard**
    // check allows it to work with `_.map`.
    _.rest = _.tail = function(array, index, guard) {
      return slice.call(array, (index == null) || guard ? 1 : index);
    };
  
    // Trim out all falsy values from an array.
    _.compact = function(array) {
      return _.filter(array, function(value){ return !!value; });
    };
  
    // Return a completely flattened version of an array.
    _.flatten = function(array, shallow) {
      return _.reduce(array, function(memo, value) {
        if (_.isArray(value)) return memo.concat(shallow ? value : _.flatten(value));
        memo[memo.length] = value;
        return memo;
      }, []);
    };
  
    // Return a version of the array that does not contain the specified value(s).
    _.without = function(array) {
      return _.difference(array, slice.call(arguments, 1));
    };
  
    // Produce a duplicate-free version of the array. If the array has already
    // been sorted, you have the option of using a faster algorithm.
    // Aliased as `unique`.
    _.uniq = _.unique = function(array, isSorted, iterator) {
      var initial = iterator ? _.map(array, iterator) : array;
      var results = [];
      // The `isSorted` flag is irrelevant if the array only contains two elements.
      if (array.length < 3) isSorted = true;
      _.reduce(initial, function (memo, value, index) {
        if (isSorted ? _.last(memo) !== value || !memo.length : !_.include(memo, value)) {
          memo.push(value);
          results.push(array[index]);
        }
        return memo;
      }, []);
      return results;
    };
  
    // Produce an array that contains the union: each distinct element from all of
    // the passed-in arrays.
    _.union = function() {
      return _.uniq(_.flatten(arguments, true));
    };
  
    // Produce an array that contains every item shared between all the
    // passed-in arrays. (Aliased as "intersect" for back-compat.)
    _.intersection = _.intersect = function(array) {
      var rest = slice.call(arguments, 1);
      return _.filter(_.uniq(array), function(item) {
        return _.every(rest, function(other) {
          return _.indexOf(other, item) >= 0;
        });
      });
    };
  
    // Take the difference between one array and a number of other arrays.
    // Only the elements present in just the first array will remain.
    _.difference = function(array) {
      var rest = _.flatten(slice.call(arguments, 1), true);
      return _.filter(array, function(value){ return !_.include(rest, value); });
    };
  
    // Zip together multiple lists into a single array -- elements that share
    // an index go together.
    _.zip = function() {
      var args = slice.call(arguments);
      var length = _.max(_.pluck(args, 'length'));
      var results = new Array(length);
      for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
      return results;
    };
  
    // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
    // we need this function. Return the position of the first occurrence of an
    // item in an array, or -1 if the item is not included in the array.
    // Delegates to **ECMAScript 5**'s native `indexOf` if available.
    // If the array is large and already in sort order, pass `true`
    // for **isSorted** to use binary search.
    _.indexOf = function(array, item, isSorted) {
      if (array == null) return -1;
      var i, l;
      if (isSorted) {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
      if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
      for (i = 0, l = array.length; i < l; i++) if (i in array && array[i] === item) return i;
      return -1;
    };
  
    // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
    _.lastIndexOf = function(array, item) {
      if (array == null) return -1;
      if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
      var i = array.length;
      while (i--) if (i in array && array[i] === item) return i;
      return -1;
    };
  
    // Generate an integer Array containing an arithmetic progression. A port of
    // the native Python `range()` function. See
    // [the Python documentation](http://docs.python.org/library/functions.html#range).
    _.range = function(start, stop, step) {
      if (arguments.length <= 1) {
        stop = start || 0;
        start = 0;
      }
      step = arguments[2] || 1;
  
      var len = Math.max(Math.ceil((stop - start) / step), 0);
      var idx = 0;
      var range = new Array(len);
  
      while(idx < len) {
        range[idx++] = start;
        start += step;
      }
  
      return range;
    };
  
    // Function (ahem) Functions
    // ------------------
  
    // Reusable constructor function for prototype setting.
    var ctor = function(){};
  
    // Create a function bound to a given object (assigning `this`, and arguments,
    // optionally). Binding with arguments is also known as `curry`.
    // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
    // We check for `func.bind` first, to fail fast when `func` is undefined.
    _.bind = function bind(func, context) {
      var bound, args;
      if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
      if (!_.isFunction(func)) throw new TypeError;
      args = slice.call(arguments, 2);
      return bound = function() {
        if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
        ctor.prototype = func.prototype;
        var self = new ctor;
        var result = func.apply(self, args.concat(slice.call(arguments)));
        if (Object(result) === result) return result;
        return self;
      };
    };
  
    // Bind all of an object's methods to that object. Useful for ensuring that
    // all callbacks defined on an object belong to it.
    _.bindAll = function(obj) {
      var funcs = slice.call(arguments, 1);
      if (funcs.length == 0) funcs = _.functions(obj);
      each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
      return obj;
    };
  
    // Memoize an expensive function by storing its results.
    _.memoize = function(func, hasher) {
      var memo = {};
      hasher || (hasher = _.identity);
      return function() {
        var key = hasher.apply(this, arguments);
        return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
      };
    };
  
    // Delays a function for the given number of milliseconds, and then calls
    // it with the arguments supplied.
    _.delay = function(func, wait) {
      var args = slice.call(arguments, 2);
      return setTimeout(function(){ return func.apply(null, args); }, wait);
    };
  
    // Defers a function, scheduling it to run after the current call stack has
    // cleared.
    _.defer = function(func) {
      return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
    };
  
    // Returns a function, that, when invoked, will only be triggered at most once
    // during a given window of time.
    _.throttle = function(func, wait) {
      var context, args, timeout, throttling, more, result;
      var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
      return function() {
        context = this; args = arguments;
        var later = function() {
          timeout = null;
          if (more) func.apply(context, args);
          whenDone();
        };
        if (!timeout) timeout = setTimeout(later, wait);
        if (throttling) {
          more = true;
        } else {
          result = func.apply(context, args);
        }
        whenDone();
        throttling = true;
        return result;
      };
    };
  
    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    _.debounce = function(func, wait, immediate) {
      var timeout;
      return function() {
        var context = this, args = arguments;
        var later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        if (immediate && !timeout) func.apply(context, args);
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    };
  
    // Returns a function that will be executed at most one time, no matter how
    // often you call it. Useful for lazy initialization.
    _.once = function(func) {
      var ran = false, memo;
      return function() {
        if (ran) return memo;
        ran = true;
        return memo = func.apply(this, arguments);
      };
    };
  
    // Returns the first function passed as an argument to the second,
    // allowing you to adjust arguments, run code before and after, and
    // conditionally execute the original function.
    _.wrap = function(func, wrapper) {
      return function() {
        var args = [func].concat(slice.call(arguments, 0));
        return wrapper.apply(this, args);
      };
    };
  
    // Returns a function that is the composition of a list of functions, each
    // consuming the return value of the function that follows.
    _.compose = function() {
      var funcs = arguments;
      return function() {
        var args = arguments;
        for (var i = funcs.length - 1; i >= 0; i--) {
          args = [funcs[i].apply(this, args)];
        }
        return args[0];
      };
    };
  
    // Returns a function that will only be executed after being called N times.
    _.after = function(times, func) {
      if (times <= 0) return func();
      return function() {
        if (--times < 1) { return func.apply(this, arguments); }
      };
    };
  
    // Object Functions
    // ----------------
  
    // Retrieve the names of an object's properties.
    // Delegates to **ECMAScript 5**'s native `Object.keys`
    _.keys = nativeKeys || function(obj) {
      if (obj !== Object(obj)) throw new TypeError('Invalid object');
      var keys = [];
      for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
      return keys;
    };
  
    // Retrieve the values of an object's properties.
    _.values = function(obj) {
      return _.map(obj, _.identity);
    };
  
    // Return a sorted list of the function names available on the object.
    // Aliased as `methods`
    _.functions = _.methods = function(obj) {
      var names = [];
      for (var key in obj) {
        if (_.isFunction(obj[key])) names.push(key);
      }
      return names.sort();
    };
  
    // Extend a given object with all the properties in passed-in object(s).
    _.extend = function(obj) {
      each(slice.call(arguments, 1), function(source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      });
      return obj;
    };
  
    // Return a copy of the object only containing the whitelisted properties.
    _.pick = function(obj) {
      var result = {};
      each(_.flatten(slice.call(arguments, 1)), function(key) {
        if (key in obj) result[key] = obj[key];
      });
      return result;
    };
  
    // Fill in a given object with default properties.
    _.defaults = function(obj) {
      each(slice.call(arguments, 1), function(source) {
        for (var prop in source) {
          if (obj[prop] == null) obj[prop] = source[prop];
        }
      });
      return obj;
    };
  
    // Create a (shallow-cloned) duplicate of an object.
    _.clone = function(obj) {
      if (!_.isObject(obj)) return obj;
      return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
    };
  
    // Invokes interceptor with the obj, and then returns obj.
    // The primary purpose of this method is to "tap into" a method chain, in
    // order to perform operations on intermediate results within the chain.
    _.tap = function(obj, interceptor) {
      interceptor(obj);
      return obj;
    };
  
    // Internal recursive comparison function.
    function eq(a, b, stack) {
      // Identical objects are equal. `0 === -0`, but they aren't identical.
      // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
      if (a === b) return a !== 0 || 1 / a == 1 / b;
      // A strict comparison is necessary because `null == undefined`.
      if (a == null || b == null) return a === b;
      // Unwrap any wrapped objects.
      if (a._chain) a = a._wrapped;
      if (b._chain) b = b._wrapped;
      // Invoke a custom `isEqual` method if one is provided.
      if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);
      if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);
      // Compare `[[Class]]` names.
      var className = toString.call(a);
      if (className != toString.call(b)) return false;
      switch (className) {
        // Strings, numbers, dates, and booleans are compared by value.
        case '[object String]':
          // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
          // equivalent to `new String("5")`.
          return a == String(b);
        case '[object Number]':
          // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
          // other numeric values.
          return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
        case '[object Date]':
        case '[object Boolean]':
          // Coerce dates and booleans to numeric primitive values. Dates are compared by their
          // millisecond representations. Note that invalid dates with millisecond representations
          // of `NaN` are not equivalent.
          return +a == +b;
        // RegExps are compared by their source patterns and flags.
        case '[object RegExp]':
          return a.source == b.source &&
                 a.global == b.global &&
                 a.multiline == b.multiline &&
                 a.ignoreCase == b.ignoreCase;
      }
      if (typeof a != 'object' || typeof b != 'object') return false;
      // Assume equality for cyclic structures. The algorithm for detecting cyclic
      // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
      var length = stack.length;
      while (length--) {
        // Linear search. Performance is inversely proportional to the number of
        // unique nested structures.
        if (stack[length] == a) return true;
      }
      // Add the first object to the stack of traversed objects.
      stack.push(a);
      var size = 0, result = true;
      // Recursively compare objects and arrays.
      if (className == '[object Array]') {
        // Compare array lengths to determine if a deep comparison is necessary.
        size = a.length;
        result = size == b.length;
        if (result) {
          // Deep compare the contents, ignoring non-numeric properties.
          while (size--) {
            // Ensure commutative equality for sparse arrays.
            if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
          }
        }
      } else {
        // Objects with different constructors are not equivalent.
        if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
        // Deep compare objects.
        for (var key in a) {
          if (_.has(a, key)) {
            // Count the expected number of properties.
            size++;
            // Deep compare each member.
            if (!(result = _.has(b, key) && eq(a[key], b[key], stack))) break;
          }
        }
        // Ensure that both objects contain the same number of properties.
        if (result) {
          for (key in b) {
            if (_.has(b, key) && !(size--)) break;
          }
          result = !size;
        }
      }
      // Remove the first object from the stack of traversed objects.
      stack.pop();
      return result;
    }
  
    // Perform a deep comparison to check if two objects are equal.
    _.isEqual = function(a, b) {
      return eq(a, b, []);
    };
  
    // Is a given array, string, or object empty?
    // An "empty" object has no enumerable own-properties.
    _.isEmpty = function(obj) {
      if (obj == null) return true;
      if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
      for (var key in obj) if (_.has(obj, key)) return false;
      return true;
    };
  
    // Is a given value a DOM element?
    _.isElement = function(obj) {
      return !!(obj && obj.nodeType == 1);
    };
  
    // Is a given value an array?
    // Delegates to ECMA5's native Array.isArray
    _.isArray = nativeIsArray || function(obj) {
      return toString.call(obj) == '[object Array]';
    };
  
    // Is a given variable an object?
    _.isObject = function(obj) {
      return obj === Object(obj);
    };
  
    // Is a given variable an arguments object?
    _.isArguments = function(obj) {
      return toString.call(obj) == '[object Arguments]';
    };
    if (!_.isArguments(arguments)) {
      _.isArguments = function(obj) {
        return !!(obj && _.has(obj, 'callee'));
      };
    }
  
    // Is a given value a function?
    _.isFunction = function(obj) {
      return toString.call(obj) == '[object Function]';
    };
  
    // Is a given value a string?
    _.isString = function(obj) {
      return toString.call(obj) == '[object String]';
    };
  
    // Is a given value a number?
    _.isNumber = function(obj) {
      return toString.call(obj) == '[object Number]';
    };
  
    // Is a given object a finite number?
    _.isFinite = function(obj) {
      return _.isNumber(obj) && isFinite(obj);
    };
  
    // Is the given value `NaN`?
    _.isNaN = function(obj) {
      // `NaN` is the only value for which `===` is not reflexive.
      return obj !== obj;
    };
  
    // Is a given value a boolean?
    _.isBoolean = function(obj) {
      return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
    };
  
    // Is a given value a date?
    _.isDate = function(obj) {
      return toString.call(obj) == '[object Date]';
    };
  
    // Is the given value a regular expression?
    _.isRegExp = function(obj) {
      return toString.call(obj) == '[object RegExp]';
    };
  
    // Is a given value equal to null?
    _.isNull = function(obj) {
      return obj === null;
    };
  
    // Is a given variable undefined?
    _.isUndefined = function(obj) {
      return obj === void 0;
    };
  
    // Has own property?
    _.has = function(obj, key) {
      return hasOwnProperty.call(obj, key);
    };
  
    // Utility Functions
    // -----------------
  
    // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
    // previous owner. Returns a reference to the Underscore object.
    _.noConflict = function() {
      root._ = previousUnderscore;
      return this;
    };
  
    // Keep the identity function around for default iterators.
    _.identity = function(value) {
      return value;
    };
  
    // Run a function **n** times.
    _.times = function (n, iterator, context) {
      for (var i = 0; i < n; i++) iterator.call(context, i);
    };
  
    // Escape a string for HTML interpolation.
    _.escape = function(string) {
      return (''+string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
    };
  
    // If the value of the named property is a function then invoke it;
    // otherwise, return it.
    _.result = function(object, property) {
      if (object == null) return null;
      var value = object[property];
      return _.isFunction(value) ? value.call(object) : value;
    };
  
    // Add your own custom functions to the Underscore object, ensuring that
    // they're correctly added to the OOP wrapper as well.
    _.mixin = function(obj) {
      each(_.functions(obj), function(name){
        addToWrapper(name, _[name] = obj[name]);
      });
    };
  
    // Generate a unique integer id (unique within the entire client session).
    // Useful for temporary DOM ids.
    var idCounter = 0;
    _.uniqueId = function(prefix) {
      var id = idCounter++;
      return prefix ? prefix + id : id;
    };
  
    // By default, Underscore uses ERB-style template delimiters, change the
    // following template settings to use alternative delimiters.
    _.templateSettings = {
      evaluate    : /<%([\s\S]+?)%>/g,
      interpolate : /<%=([\s\S]+?)%>/g,
      escape      : /<%-([\s\S]+?)%>/g
    };
  
    // When customizing `templateSettings`, if you don't want to define an
    // interpolation, evaluation or escaping regex, we need one that is
    // guaranteed not to match.
    var noMatch = /.^/;
  
    // Certain characters need to be escaped so that they can be put into a
    // string literal.
    var escapes = {
      '\\': '\\',
      "'": "'",
      'r': '\r',
      'n': '\n',
      't': '\t',
      'u2028': '\u2028',
      'u2029': '\u2029'
    };
  
    for (var p in escapes) escapes[escapes[p]] = p;
    var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
    var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;
  
    // Within an interpolation, evaluation, or escaping, remove HTML escaping
    // that had been previously added.
    var unescape = function(code) {
      return code.replace(unescaper, function(match, escape) {
        return escapes[escape];
      });
    };
  
    // JavaScript micro-templating, similar to John Resig's implementation.
    // Underscore templating handles arbitrary delimiters, preserves whitespace,
    // and correctly escapes quotes within interpolated code.
    _.template = function(text, data, settings) {
      settings = _.defaults(settings || {}, _.templateSettings);
  
      // Compile the template source, taking care to escape characters that
      // cannot be included in a string literal and then unescape them in code
      // blocks.
      var source = "__p+='" + text
        .replace(escaper, function(match) {
          return '\\' + escapes[match];
        })
        .replace(settings.escape || noMatch, function(match, code) {
          return "'+\n_.escape(" + unescape(code) + ")+\n'";
        })
        .replace(settings.interpolate || noMatch, function(match, code) {
          return "'+\n(" + unescape(code) + ")+\n'";
        })
        .replace(settings.evaluate || noMatch, function(match, code) {
          return "';\n" + unescape(code) + "\n;__p+='";
        }) + "';\n";
  
      // If a variable is not specified, place data values in local scope.
      if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';
  
      source = "var __p='';" +
        "var print=function(){__p+=Array.prototype.join.call(arguments, '')};\n" +
        source + "return __p;\n";
  
      var render = new Function(settings.variable || 'obj', '_', source);
      if (data) return render(data, _);
      var template = function(data) {
        return render.call(this, data, _);
      };
  
      // Provide the compiled function source as a convenience for build time
      // precompilation.
      template.source = 'function(' + (settings.variable || 'obj') + '){\n' +
        source + '}';
  
      return template;
    };
  
    // Add a "chain" function, which will delegate to the wrapper.
    _.chain = function(obj) {
      return _(obj).chain();
    };
  
    // The OOP Wrapper
    // ---------------
  
    // If Underscore is called as a function, it returns a wrapped object that
    // can be used OO-style. This wrapper holds altered versions of all the
    // underscore functions. Wrapped objects may be chained.
    var wrapper = function(obj) { this._wrapped = obj; };
  
    // Expose `wrapper.prototype` as `_.prototype`
    _.prototype = wrapper.prototype;
  
    // Helper function to continue chaining intermediate results.
    var result = function(obj, chain) {
      return chain ? _(obj).chain() : obj;
    };
  
    // A method to easily add functions to the OOP wrapper.
    var addToWrapper = function(name, func) {
      wrapper.prototype[name] = function() {
        var args = slice.call(arguments);
        unshift.call(args, this._wrapped);
        return result(func.apply(_, args), this._chain);
      };
    };
  
    // Add all of the Underscore functions to the wrapper object.
    _.mixin(_);
  
    // Add all mutator Array functions to the wrapper.
    each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
      var method = ArrayProto[name];
      wrapper.prototype[name] = function() {
        var wrapped = this._wrapped;
        method.apply(wrapped, arguments);
        var length = wrapped.length;
        if ((name == 'shift' || name == 'splice') && length === 0) delete wrapped[0];
        return result(wrapped, this._chain);
      };
    });
  
    // Add all accessor Array functions to the wrapper.
    each(['concat', 'join', 'slice'], function(name) {
      var method = ArrayProto[name];
      wrapper.prototype[name] = function() {
        return result(method.apply(this._wrapped, arguments), this._chain);
      };
    });
  
    // Start chaining a wrapped Underscore object.
    wrapper.prototype.chain = function() {
      this._chain = true;
      return this;
    };
  
    // Extracts the result from a wrapped and chained object.
    wrapper.prototype.value = function() {
      return this._wrapped;
    };
  
  }).call(this);
  

  provide("underscore", module.exports);

  $.ender(module.exports);

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  //     Backbone.js 0.9.2
  
  //     (c) 2010-2012 Jeremy Ashkenas, DocumentCloud Inc.
  //     Backbone may be freely distributed under the MIT license.
  //     For all details and documentation:
  //     http://backbonejs.org
  
  (function(){
  
    // Initial Setup
    // -------------
  
    // Save a reference to the global object (`window` in the browser, `global`
    // on the server).
    var root = this;
  
    // Save the previous value of the `Backbone` variable, so that it can be
    // restored later on, if `noConflict` is used.
    var previousBackbone = root.Backbone;
  
    // Create a local reference to slice/splice.
    var slice = Array.prototype.slice;
    var splice = Array.prototype.splice;
  
    // The top-level namespace. All public Backbone classes and modules will
    // be attached to this. Exported for both CommonJS and the browser.
    var Backbone;
    if (typeof exports !== 'undefined') {
      Backbone = exports;
    } else {
      Backbone = root.Backbone = {};
    }
  
    // Current version of the library. Keep in sync with `package.json`.
    Backbone.VERSION = '0.9.2';
  
    // Require Underscore, if we're on the server, and it's not already present.
    var _ = root._;
    if (!_ && (typeof require !== 'undefined')) _ = require('underscore');
  
    // For Backbone's purposes, jQuery, Zepto, or Ender owns the `$` variable.
    var $ = root.jQuery || root.Zepto || root.ender;
  
    // Set the JavaScript library that will be used for DOM manipulation and
    // Ajax calls (a.k.a. the `$` variable). By default Backbone will use: jQuery,
    // Zepto, or Ender; but the `setDomLibrary()` method lets you inject an
    // alternate JavaScript library (or a mock library for testing your views
    // outside of a browser).
    Backbone.setDomLibrary = function(lib) {
      $ = lib;
    };
  
    // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
    // to its previous owner. Returns a reference to this Backbone object.
    Backbone.noConflict = function() {
      root.Backbone = previousBackbone;
      return this;
    };
  
    // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
    // will fake `"PUT"` and `"DELETE"` requests via the `_method` parameter and
    // set a `X-Http-Method-Override` header.
    Backbone.emulateHTTP = false;
  
    // Turn on `emulateJSON` to support legacy servers that can't deal with direct
    // `application/json` requests ... will encode the body as
    // `application/x-www-form-urlencoded` instead and will send the model in a
    // form param named `model`.
    Backbone.emulateJSON = false;
  
    // Backbone.Events
    // -----------------
  
    // Regular expression used to split event strings
    var eventSplitter = /\s+/;
  
    // A module that can be mixed in to *any object* in order to provide it with
    // custom events. You may bind with `on` or remove with `off` callback functions
    // to an event; trigger`-ing an event fires all callbacks in succession.
    //
    //     var object = {};
    //     _.extend(object, Backbone.Events);
    //     object.on('expand', function(){ alert('expanded'); });
    //     object.trigger('expand');
    //
    var Events = Backbone.Events = {
  
      // Bind one or more space separated events, `events`, to a `callback`
      // function. Passing `"all"` will bind the callback to all events fired.
      on: function(events, callback, context) {
  
        var calls, event, node, tail, list;
        if (!callback) return this;
        events = events.split(eventSplitter);
        calls = this._callbacks || (this._callbacks = {});
  
        // Create an immutable callback list, allowing traversal during
        // modification.  The tail is an empty object that will always be used
        // as the next node.
        while (event = events.shift()) {
          list = calls[event];
          node = list ? list.tail : {};
          node.next = tail = {};
          node.context = context;
          node.callback = callback;
          calls[event] = {tail: tail, next: list ? list.next : node};
        }
  
        return this;
      },
  
      // Remove one or many callbacks. If `context` is null, removes all callbacks
      // with that function. If `callback` is null, removes all callbacks for the
      // event. If `events` is null, removes all bound callbacks for all events.
      off: function(events, callback, context) {
        var event, calls, node, tail, cb, ctx;
  
        // No events, or removing *all* events.
        if (!(calls = this._callbacks)) return;
        if (!(events || callback || context)) {
          delete this._callbacks;
          return this;
        }
  
        // Loop through the listed events and contexts, splicing them out of the
        // linked list of callbacks if appropriate.
        events = events ? events.split(eventSplitter) : _.keys(calls);
        while (event = events.shift()) {
          node = calls[event];
          delete calls[event];
          if (!node || !(callback || context)) continue;
          // Create a new list, omitting the indicated callbacks.
          tail = node.tail;
          while ((node = node.next) !== tail) {
            cb = node.callback;
            ctx = node.context;
            if ((callback && cb !== callback) || (context && ctx !== context)) {
              this.on(event, cb, ctx);
            }
          }
        }
  
        return this;
      },
  
      // Trigger one or many events, firing all bound callbacks. Callbacks are
      // passed the same arguments as `trigger` is, apart from the event name
      // (unless you're listening on `"all"`, which will cause your callback to
      // receive the true name of the event as the first argument).
      trigger: function(events) {
        var event, node, calls, tail, args, all, rest;
        if (!(calls = this._callbacks)) return this;
        all = calls.all;
        events = events.split(eventSplitter);
        rest = slice.call(arguments, 1);
  
        // For each event, walk through the linked list of callbacks twice,
        // first to trigger the event, then to trigger any `"all"` callbacks.
        while (event = events.shift()) {
          if (node = calls[event]) {
            tail = node.tail;
            while ((node = node.next) !== tail) {
              node.callback.apply(node.context || this, rest);
            }
          }
          if (node = all) {
            tail = node.tail;
            args = [event].concat(rest);
            while ((node = node.next) !== tail) {
              node.callback.apply(node.context || this, args);
            }
          }
        }
  
        return this;
      }
  
    };
  
    // Aliases for backwards compatibility.
    Events.bind   = Events.on;
    Events.unbind = Events.off;
  
    // Backbone.Model
    // --------------
  
    // Create a new model, with defined attributes. A client id (`cid`)
    // is automatically generated and assigned for you.
    var Model = Backbone.Model = function(attributes, options) {
      var defaults;
      attributes || (attributes = {});
      if (options && options.parse) attributes = this.parse(attributes);
      if (defaults = getValue(this, 'defaults')) {
        attributes = _.extend({}, defaults, attributes);
      }
      if (options && options.collection) this.collection = options.collection;
      this.attributes = {};
      this._escapedAttributes = {};
      this.cid = _.uniqueId('c');
      this.changed = {};
      this._silent = {};
      this._pending = {};
      this.set(attributes, {silent: true});
      // Reset change tracking.
      this.changed = {};
      this._silent = {};
      this._pending = {};
      this._previousAttributes = _.clone(this.attributes);
      this.initialize.apply(this, arguments);
    };
  
    // Attach all inheritable methods to the Model prototype.
    _.extend(Model.prototype, Events, {
  
      // A hash of attributes whose current and previous value differ.
      changed: null,
  
      // A hash of attributes that have silently changed since the last time
      // `change` was called.  Will become pending attributes on the next call.
      _silent: null,
  
      // A hash of attributes that have changed since the last `'change'` event
      // began.
      _pending: null,
  
      // The default name for the JSON `id` attribute is `"id"`. MongoDB and
      // CouchDB users may want to set this to `"_id"`.
      idAttribute: 'id',
  
      // Initialize is an empty function by default. Override it with your own
      // initialization logic.
      initialize: function(){},
  
      // Return a copy of the model's `attributes` object.
      toJSON: function(options) {
        return _.clone(this.attributes);
      },
  
      // Get the value of an attribute.
      get: function(attr) {
        return this.attributes[attr];
      },
  
      // Get the HTML-escaped value of an attribute.
      escape: function(attr) {
        var html;
        if (html = this._escapedAttributes[attr]) return html;
        var val = this.get(attr);
        return this._escapedAttributes[attr] = _.escape(val == null ? '' : '' + val);
      },
  
      // Returns `true` if the attribute contains a value that is not null
      // or undefined.
      has: function(attr) {
        return this.get(attr) != null;
      },
  
      // Set a hash of model attributes on the object, firing `"change"` unless
      // you choose to silence it.
      set: function(key, value, options) {
        var attrs, attr, val;
  
        // Handle both
        if (_.isObject(key) || key == null) {
          attrs = key;
          options = value;
        } else {
          attrs = {};
          attrs[key] = value;
        }
  
        // Extract attributes and options.
        options || (options = {});
        if (!attrs) return this;
        if (attrs instanceof Model) attrs = attrs.attributes;
        if (options.unset) for (attr in attrs) attrs[attr] = void 0;
  
        // Run validation.
        if (!this._validate(attrs, options)) return false;
  
        // Check for changes of `id`.
        if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];
  
        var changes = options.changes = {};
        var now = this.attributes;
        var escaped = this._escapedAttributes;
        var prev = this._previousAttributes || {};
  
        // For each `set` attribute...
        for (attr in attrs) {
          val = attrs[attr];
  
          // If the new and current value differ, record the change.
          if (!_.isEqual(now[attr], val) || (options.unset && _.has(now, attr))) {
            delete escaped[attr];
            (options.silent ? this._silent : changes)[attr] = true;
          }
  
          // Update or delete the current value.
          options.unset ? delete now[attr] : now[attr] = val;
  
          // If the new and previous value differ, record the change.  If not,
          // then remove changes for this attribute.
          if (!_.isEqual(prev[attr], val) || (_.has(now, attr) != _.has(prev, attr))) {
            this.changed[attr] = val;
            if (!options.silent) this._pending[attr] = true;
          } else {
            delete this.changed[attr];
            delete this._pending[attr];
          }
        }
  
        // Fire the `"change"` events.
        if (!options.silent) this.change(options);
        return this;
      },
  
      // Remove an attribute from the model, firing `"change"` unless you choose
      // to silence it. `unset` is a noop if the attribute doesn't exist.
      unset: function(attr, options) {
        (options || (options = {})).unset = true;
        return this.set(attr, null, options);
      },
  
      // Clear all attributes on the model, firing `"change"` unless you choose
      // to silence it.
      clear: function(options) {
        (options || (options = {})).unset = true;
        return this.set(_.clone(this.attributes), options);
      },
  
      // Fetch the model from the server. If the server's representation of the
      // model differs from its current attributes, they will be overriden,
      // triggering a `"change"` event.
      fetch: function(options) {
        options = options ? _.clone(options) : {};
        var model = this;
        var success = options.success;
        options.success = function(resp, status, xhr) {
          if (!model.set(model.parse(resp, xhr), options)) return false;
          if (success) success(model, resp);
        };
        options.error = Backbone.wrapError(options.error, model, options);
        return (this.sync || Backbone.sync).call(this, 'read', this, options);
      },
  
      // Set a hash of model attributes, and sync the model to the server.
      // If the server returns an attributes hash that differs, the model's
      // state will be `set` again.
      save: function(key, value, options) {
        var attrs, current;
  
        // Handle both `("key", value)` and `({key: value})` -style calls.
        if (_.isObject(key) || key == null) {
          attrs = key;
          options = value;
        } else {
          attrs = {};
          attrs[key] = value;
        }
        options = options ? _.clone(options) : {};
  
        // If we're "wait"-ing to set changed attributes, validate early.
        if (options.wait) {
          if (!this._validate(attrs, options)) return false;
          current = _.clone(this.attributes);
        }
  
        // Regular saves `set` attributes before persisting to the server.
        var silentOptions = _.extend({}, options, {silent: true});
        if (attrs && !this.set(attrs, options.wait ? silentOptions : options)) {
          return false;
        }
  
        // After a successful server-side save, the client is (optionally)
        // updated with the server-side state.
        var model = this;
        var success = options.success;
        options.success = function(resp, status, xhr) {
          var serverAttrs = model.parse(resp, xhr);
          if (options.wait) {
            delete options.wait;
            serverAttrs = _.extend(attrs || {}, serverAttrs);
          }
          if (!model.set(serverAttrs, options)) return false;
          if (success) {
            success(model, resp);
          } else {
            model.trigger('sync', model, resp, options);
          }
        };
  
        // Finish configuring and sending the Ajax request.
        options.error = Backbone.wrapError(options.error, model, options);
        var method = this.isNew() ? 'create' : 'update';
        var xhr = (this.sync || Backbone.sync).call(this, method, this, options);
        if (options.wait) this.set(current, silentOptions);
        return xhr;
      },
  
      // Destroy this model on the server if it was already persisted.
      // Optimistically removes the model from its collection, if it has one.
      // If `wait: true` is passed, waits for the server to respond before removal.
      destroy: function(options) {
        options = options ? _.clone(options) : {};
        var model = this;
        var success = options.success;
  
        var triggerDestroy = function() {
          model.trigger('destroy', model, model.collection, options);
        };
  
        if (this.isNew()) {
          triggerDestroy();
          return false;
        }
  
        options.success = function(resp) {
          if (options.wait) triggerDestroy();
          if (success) {
            success(model, resp);
          } else {
            model.trigger('sync', model, resp, options);
          }
        };
  
        options.error = Backbone.wrapError(options.error, model, options);
        var xhr = (this.sync || Backbone.sync).call(this, 'delete', this, options);
        if (!options.wait) triggerDestroy();
        return xhr;
      },
  
      // Default URL for the model's representation on the server -- if you're
      // using Backbone's restful methods, override this to change the endpoint
      // that will be called.
      url: function() {
        var base = getValue(this, 'urlRoot') || getValue(this.collection, 'url') || urlError();
        if (this.isNew()) return base;
        return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + encodeURIComponent(this.id);
      },
  
      // **parse** converts a response into the hash of attributes to be `set` on
      // the model. The default implementation is just to pass the response along.
      parse: function(resp, xhr) {
        return resp;
      },
  
      // Create a new model with identical attributes to this one.
      clone: function() {
        return new this.constructor(this.attributes);
      },
  
      // A model is new if it has never been saved to the server, and lacks an id.
      isNew: function() {
        return this.id == null;
      },
  
      // Call this method to manually fire a `"change"` event for this model and
      // a `"change:attribute"` event for each changed attribute.
      // Calling this will cause all objects observing the model to update.
      change: function(options) {
        options || (options = {});
        var changing = this._changing;
        this._changing = true;
  
        // Silent changes become pending changes.
        for (var attr in this._silent) this._pending[attr] = true;
  
        // Silent changes are triggered.
        var changes = _.extend({}, options.changes, this._silent);
        this._silent = {};
        for (var attr in changes) {
          this.trigger('change:' + attr, this, this.get(attr), options);
        }
        if (changing) return this;
  
        // Continue firing `"change"` events while there are pending changes.
        while (!_.isEmpty(this._pending)) {
          this._pending = {};
          this.trigger('change', this, options);
          // Pending and silent changes still remain.
          for (var attr in this.changed) {
            if (this._pending[attr] || this._silent[attr]) continue;
            delete this.changed[attr];
          }
          this._previousAttributes = _.clone(this.attributes);
        }
  
        this._changing = false;
        return this;
      },
  
      // Determine if the model has changed since the last `"change"` event.
      // If you specify an attribute name, determine if that attribute has changed.
      hasChanged: function(attr) {
        if (!arguments.length) return !_.isEmpty(this.changed);
        return _.has(this.changed, attr);
      },
  
      // Return an object containing all the attributes that have changed, or
      // false if there are no changed attributes. Useful for determining what
      // parts of a view need to be updated and/or what attributes need to be
      // persisted to the server. Unset attributes will be set to undefined.
      // You can also pass an attributes object to diff against the model,
      // determining if there *would be* a change.
      changedAttributes: function(diff) {
        if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
        var val, changed = false, old = this._previousAttributes;
        for (var attr in diff) {
          if (_.isEqual(old[attr], (val = diff[attr]))) continue;
          (changed || (changed = {}))[attr] = val;
        }
        return changed;
      },
  
      // Get the previous value of an attribute, recorded at the time the last
      // `"change"` event was fired.
      previous: function(attr) {
        if (!arguments.length || !this._previousAttributes) return null;
        return this._previousAttributes[attr];
      },
  
      // Get all of the attributes of the model at the time of the previous
      // `"change"` event.
      previousAttributes: function() {
        return _.clone(this._previousAttributes);
      },
  
      // Check if the model is currently in a valid state. It's only possible to
      // get into an *invalid* state if you're using silent changes.
      isValid: function() {
        return !this.validate(this.attributes);
      },
  
      // Run validation against the next complete set of model attributes,
      // returning `true` if all is well. If a specific `error` callback has
      // been passed, call that instead of firing the general `"error"` event.
      _validate: function(attrs, options) {
        if (options.silent || !this.validate) return true;
        attrs = _.extend({}, this.attributes, attrs);
        var error = this.validate(attrs, options);
        if (!error) return true;
        if (options && options.error) {
          options.error(this, error, options);
        } else {
          this.trigger('error', this, error, options);
        }
        return false;
      }
  
    });
  
    // Backbone.Collection
    // -------------------
  
    // Provides a standard collection class for our sets of models, ordered
    // or unordered. If a `comparator` is specified, the Collection will maintain
    // its models in sort order, as they're added and removed.
    var Collection = Backbone.Collection = function(models, options) {
      options || (options = {});
      if (options.model) this.model = options.model;
      if (options.comparator) this.comparator = options.comparator;
      this._reset();
      this.initialize.apply(this, arguments);
      if (models) this.reset(models, {silent: true, parse: options.parse});
    };
  
    // Define the Collection's inheritable methods.
    _.extend(Collection.prototype, Events, {
  
      // The default model for a collection is just a **Backbone.Model**.
      // This should be overridden in most cases.
      model: Model,
  
      // Initialize is an empty function by default. Override it with your own
      // initialization logic.
      initialize: function(){},
  
      // The JSON representation of a Collection is an array of the
      // models' attributes.
      toJSON: function(options) {
        return this.map(function(model){ return model.toJSON(options); });
      },
  
      // Add a model, or list of models to the set. Pass **silent** to avoid
      // firing the `add` event for every new model.
      add: function(models, options) {
        var i, index, length, model, cid, id, cids = {}, ids = {}, dups = [];
        options || (options = {});
        models = _.isArray(models) ? models.slice() : [models];
  
        // Begin by turning bare objects into model references, and preventing
        // invalid models or duplicate models from being added.
        for (i = 0, length = models.length; i < length; i++) {
          if (!(model = models[i] = this._prepareModel(models[i], options))) {
            throw new Error("Can't add an invalid model to a collection");
          }
          cid = model.cid;
          id = model.id;
          if (cids[cid] || this._byCid[cid] || ((id != null) && (ids[id] || this._byId[id]))) {
            dups.push(i);
            continue;
          }
          cids[cid] = ids[id] = model;
        }
  
        // Remove duplicates.
        i = dups.length;
        while (i--) {
          models.splice(dups[i], 1);
        }
  
        // Listen to added models' events, and index models for lookup by
        // `id` and by `cid`.
        for (i = 0, length = models.length; i < length; i++) {
          (model = models[i]).on('all', this._onModelEvent, this);
          this._byCid[model.cid] = model;
          if (model.id != null) this._byId[model.id] = model;
        }
  
        // Insert models into the collection, re-sorting if needed, and triggering
        // `add` events unless silenced.
        this.length += length;
        index = options.at != null ? options.at : this.models.length;
        splice.apply(this.models, [index, 0].concat(models));
        if (this.comparator) this.sort({silent: true});
        if (options.silent) return this;
        for (i = 0, length = this.models.length; i < length; i++) {
          if (!cids[(model = this.models[i]).cid]) continue;
          options.index = i;
          model.trigger('add', model, this, options);
        }
        return this;
      },
  
      // Remove a model, or a list of models from the set. Pass silent to avoid
      // firing the `remove` event for every model removed.
      remove: function(models, options) {
        var i, l, index, model;
        options || (options = {});
        models = _.isArray(models) ? models.slice() : [models];
        for (i = 0, l = models.length; i < l; i++) {
          model = this.getByCid(models[i]) || this.get(models[i]);
          if (!model) continue;
          delete this._byId[model.id];
          delete this._byCid[model.cid];
          index = this.indexOf(model);
          this.models.splice(index, 1);
          this.length--;
          if (!options.silent) {
            options.index = index;
            model.trigger('remove', model, this, options);
          }
          this._removeReference(model);
        }
        return this;
      },
  
      // Add a model to the end of the collection.
      push: function(model, options) {
        model = this._prepareModel(model, options);
        this.add(model, options);
        return model;
      },
  
      // Remove a model from the end of the collection.
      pop: function(options) {
        var model = this.at(this.length - 1);
        this.remove(model, options);
        return model;
      },
  
      // Add a model to the beginning of the collection.
      unshift: function(model, options) {
        model = this._prepareModel(model, options);
        this.add(model, _.extend({at: 0}, options));
        return model;
      },
  
      // Remove a model from the beginning of the collection.
      shift: function(options) {
        var model = this.at(0);
        this.remove(model, options);
        return model;
      },
  
      // Get a model from the set by id.
      get: function(id) {
        if (id == null) return void 0;
        return this._byId[id.id != null ? id.id : id];
      },
  
      // Get a model from the set by client id.
      getByCid: function(cid) {
        return cid && this._byCid[cid.cid || cid];
      },
  
      // Get the model at the given index.
      at: function(index) {
        return this.models[index];
      },
  
      // Return models with matching attributes. Useful for simple cases of `filter`.
      where: function(attrs) {
        if (_.isEmpty(attrs)) return [];
        return this.filter(function(model) {
          for (var key in attrs) {
            if (attrs[key] !== model.get(key)) return false;
          }
          return true;
        });
      },
  
      // Force the collection to re-sort itself. You don't need to call this under
      // normal circumstances, as the set will maintain sort order as each item
      // is added.
      sort: function(options) {
        options || (options = {});
        if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
        var boundComparator = _.bind(this.comparator, this);
        if (this.comparator.length == 1) {
          this.models = this.sortBy(boundComparator);
        } else {
          this.models.sort(boundComparator);
        }
        if (!options.silent) this.trigger('reset', this, options);
        return this;
      },
  
      // Pluck an attribute from each model in the collection.
      pluck: function(attr) {
        return _.map(this.models, function(model){ return model.get(attr); });
      },
  
      // When you have more items than you want to add or remove individually,
      // you can reset the entire set with a new list of models, without firing
      // any `add` or `remove` events. Fires `reset` when finished.
      reset: function(models, options) {
        models  || (models = []);
        options || (options = {});
        for (var i = 0, l = this.models.length; i < l; i++) {
          this._removeReference(this.models[i]);
        }
        this._reset();
        this.add(models, _.extend({silent: true}, options));
        if (!options.silent) this.trigger('reset', this, options);
        return this;
      },
  
      // Fetch the default set of models for this collection, resetting the
      // collection when they arrive. If `add: true` is passed, appends the
      // models to the collection instead of resetting.
      fetch: function(options) {
        options = options ? _.clone(options) : {};
        if (options.parse === undefined) options.parse = true;
        var collection = this;
        var success = options.success;
        options.success = function(resp, status, xhr) {
          collection[options.add ? 'add' : 'reset'](collection.parse(resp, xhr), options);
          if (success) success(collection, resp);
        };
        options.error = Backbone.wrapError(options.error, collection, options);
        return (this.sync || Backbone.sync).call(this, 'read', this, options);
      },
  
      // Create a new instance of a model in this collection. Add the model to the
      // collection immediately, unless `wait: true` is passed, in which case we
      // wait for the server to agree.
      create: function(model, options) {
        var coll = this;
        options = options ? _.clone(options) : {};
        model = this._prepareModel(model, options);
        if (!model) return false;
        if (!options.wait) coll.add(model, options);
        var success = options.success;
        options.success = function(nextModel, resp, xhr) {
          if (options.wait) coll.add(nextModel, options);
          if (success) {
            success(nextModel, resp);
          } else {
            nextModel.trigger('sync', model, resp, options);
          }
        };
        model.save(null, options);
        return model;
      },
  
      // **parse** converts a response into a list of models to be added to the
      // collection. The default implementation is just to pass it through.
      parse: function(resp, xhr) {
        return resp;
      },
  
      // Proxy to _'s chain. Can't be proxied the same way the rest of the
      // underscore methods are proxied because it relies on the underscore
      // constructor.
      chain: function () {
        return _(this.models).chain();
      },
  
      // Reset all internal state. Called when the collection is reset.
      _reset: function(options) {
        this.length = 0;
        this.models = [];
        this._byId  = {};
        this._byCid = {};
      },
  
      // Prepare a model or hash of attributes to be added to this collection.
      _prepareModel: function(model, options) {
        options || (options = {});
        if (!(model instanceof Model)) {
          var attrs = model;
          options.collection = this;
          model = new this.model(attrs, options);
          if (!model._validate(model.attributes, options)) model = false;
        } else if (!model.collection) {
          model.collection = this;
        }
        return model;
      },
  
      // Internal method to remove a model's ties to a collection.
      _removeReference: function(model) {
        if (this == model.collection) {
          delete model.collection;
        }
        model.off('all', this._onModelEvent, this);
      },
  
      // Internal method called every time a model in the set fires an event.
      // Sets need to update their indexes when models change ids. All other
      // events simply proxy through. "add" and "remove" events that originate
      // in other collections are ignored.
      _onModelEvent: function(event, model, collection, options) {
        if ((event == 'add' || event == 'remove') && collection != this) return;
        if (event == 'destroy') {
          this.remove(model, options);
        }
        if (model && event === 'change:' + model.idAttribute) {
          delete this._byId[model.previous(model.idAttribute)];
          this._byId[model.id] = model;
        }
        this.trigger.apply(this, arguments);
      }
  
    });
  
    // Underscore methods that we want to implement on the Collection.
    var methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find',
      'detect', 'filter', 'select', 'reject', 'every', 'all', 'some', 'any',
      'include', 'contains', 'invoke', 'max', 'min', 'sortBy', 'sortedIndex',
      'toArray', 'size', 'first', 'initial', 'rest', 'last', 'without', 'indexOf',
      'shuffle', 'lastIndexOf', 'isEmpty', 'groupBy'];
  
    // Mix in each Underscore method as a proxy to `Collection#models`.
    _.each(methods, function(method) {
      Collection.prototype[method] = function() {
        return _[method].apply(_, [this.models].concat(_.toArray(arguments)));
      };
    });
  
    // Backbone.Router
    // -------------------
  
    // Routers map faux-URLs to actions, and fire events when routes are
    // matched. Creating a new one sets its `routes` hash, if not set statically.
    var Router = Backbone.Router = function(options) {
      options || (options = {});
      if (options.routes) this.routes = options.routes;
      this._bindRoutes();
      this.initialize.apply(this, arguments);
    };
  
    // Cached regular expressions for matching named param parts and splatted
    // parts of route strings.
    var namedParam    = /:\w+/g;
    var splatParam    = /\*\w+/g;
    var escapeRegExp  = /[-[\]{}()+?.,\\^$|#\s]/g;
  
    // Set up all inheritable **Backbone.Router** properties and methods.
    _.extend(Router.prototype, Events, {
  
      // Initialize is an empty function by default. Override it with your own
      // initialization logic.
      initialize: function(){},
  
      // Manually bind a single named route to a callback. For example:
      //
      //     this.route('search/:query/p:num', 'search', function(query, num) {
      //       ...
      //     });
      //
      route: function(route, name, callback) {
        Backbone.history || (Backbone.history = new History);
        if (!_.isRegExp(route)) route = this._routeToRegExp(route);
        if (!callback) callback = this[name];
        Backbone.history.route(route, _.bind(function(fragment) {
          var args = this._extractParameters(route, fragment);
          callback && callback.apply(this, args);
          this.trigger.apply(this, ['route:' + name].concat(args));
          Backbone.history.trigger('route', this, name, args);
        }, this));
        return this;
      },
  
      // Simple proxy to `Backbone.history` to save a fragment into the history.
      navigate: function(fragment, options) {
        Backbone.history.navigate(fragment, options);
      },
  
      // Bind all defined routes to `Backbone.history`. We have to reverse the
      // order of the routes here to support behavior where the most general
      // routes can be defined at the bottom of the route map.
      _bindRoutes: function() {
        if (!this.routes) return;
        var routes = [];
        for (var route in this.routes) {
          routes.unshift([route, this.routes[route]]);
        }
        for (var i = 0, l = routes.length; i < l; i++) {
          this.route(routes[i][0], routes[i][1], this[routes[i][1]]);
        }
      },
  
      // Convert a route string into a regular expression, suitable for matching
      // against the current location hash.
      _routeToRegExp: function(route) {
        route = route.replace(escapeRegExp, '\\$&')
                     .replace(namedParam, '([^\/]+)')
                     .replace(splatParam, '(.*?)');
        return new RegExp('^' + route + '$');
      },
  
      // Given a route, and a URL fragment that it matches, return the array of
      // extracted parameters.
      _extractParameters: function(route, fragment) {
        return route.exec(fragment).slice(1);
      }
  
    });
  
    // Backbone.History
    // ----------------
  
    // Handles cross-browser history management, based on URL fragments. If the
    // browser does not support `onhashchange`, falls back to polling.
    var History = Backbone.History = function() {
      this.handlers = [];
      _.bindAll(this, 'checkUrl');
    };
  
    // Cached regex for cleaning leading hashes and slashes .
    var routeStripper = /^[#\/]/;
  
    // Cached regex for detecting MSIE.
    var isExplorer = /msie [\w.]+/;
  
    // Has the history handling already been started?
    History.started = false;
  
    // Set up all inheritable **Backbone.History** properties and methods.
    _.extend(History.prototype, Events, {
  
      // The default interval to poll for hash changes, if necessary, is
      // twenty times a second.
      interval: 50,
  
      // Gets the true hash value. Cannot use location.hash directly due to bug
      // in Firefox where location.hash will always be decoded.
      getHash: function(windowOverride) {
        var loc = windowOverride ? windowOverride.location : window.location;
        var match = loc.href.match(/#(.*)$/);
        return match ? match[1] : '';
      },
  
      // Get the cross-browser normalized URL fragment, either from the URL,
      // the hash, or the override.
      getFragment: function(fragment, forcePushState) {
        if (fragment == null) {
          if (this._hasPushState || forcePushState) {
            fragment = window.location.pathname;
            var search = window.location.search;
            if (search) fragment += search;
          } else {
            fragment = this.getHash();
          }
        }
        if (!fragment.indexOf(this.options.root)) fragment = fragment.substr(this.options.root.length);
        return fragment.replace(routeStripper, '');
      },
  
      // Start the hash change handling, returning `true` if the current URL matches
      // an existing route, and `false` otherwise.
      start: function(options) {
        if (History.started) throw new Error("Backbone.history has already been started");
        History.started = true;
  
        // Figure out the initial configuration. Do we need an iframe?
        // Is pushState desired ... is it available?
        this.options          = _.extend({}, {root: '/'}, this.options, options);
        this._wantsHashChange = this.options.hashChange !== false;
        this._wantsPushState  = !!this.options.pushState;
        this._hasPushState    = !!(this.options.pushState && window.history && window.history.pushState);
        var fragment          = this.getFragment();
        var docMode           = document.documentMode;
        var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));
  
        if (oldIE) {
          this.iframe = $('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
          this.navigate(fragment);
        }
  
        // Depending on whether we're using pushState or hashes, and whether
        // 'onhashchange' is supported, determine how we check the URL state.
        if (this._hasPushState) {
          $(window).bind('popstate', this.checkUrl);
        } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
          $(window).bind('hashchange', this.checkUrl);
        } else if (this._wantsHashChange) {
          this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
        }
  
        // Determine if we need to change the base url, for a pushState link
        // opened by a non-pushState browser.
        this.fragment = fragment;
        var loc = window.location;
        var atRoot  = loc.pathname == this.options.root;
  
        // If we've started off with a route from a `pushState`-enabled browser,
        // but we're currently in a browser that doesn't support it...
        if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot) {
          this.fragment = this.getFragment(null, true);
          window.location.replace(this.options.root + '#' + this.fragment);
          // Return immediately as browser will do redirect to new url
          return true;
  
        // Or if we've started out with a hash-based route, but we're currently
        // in a browser where it could be `pushState`-based instead...
        } else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
          this.fragment = this.getHash().replace(routeStripper, '');
          window.history.replaceState({}, document.title, loc.protocol + '//' + loc.host + this.options.root + this.fragment);
        }
  
        if (!this.options.silent) {
          return this.loadUrl();
        }
      },
  
      // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
      // but possibly useful for unit testing Routers.
      stop: function() {
        $(window).unbind('popstate', this.checkUrl).unbind('hashchange', this.checkUrl);
        clearInterval(this._checkUrlInterval);
        History.started = false;
      },
  
      // Add a route to be tested when the fragment changes. Routes added later
      // may override previous routes.
      route: function(route, callback) {
        this.handlers.unshift({route: route, callback: callback});
      },
  
      // Checks the current URL to see if it has changed, and if it has,
      // calls `loadUrl`, normalizing across the hidden iframe.
      checkUrl: function(e) {
        var current = this.getFragment();
        if (current == this.fragment && this.iframe) current = this.getFragment(this.getHash(this.iframe));
        if (current == this.fragment) return false;
        if (this.iframe) this.navigate(current);
        this.loadUrl() || this.loadUrl(this.getHash());
      },
  
      // Attempt to load the current URL fragment. If a route succeeds with a
      // match, returns `true`. If no defined routes matches the fragment,
      // returns `false`.
      loadUrl: function(fragmentOverride) {
        var fragment = this.fragment = this.getFragment(fragmentOverride);
        var matched = _.any(this.handlers, function(handler) {
          if (handler.route.test(fragment)) {
            handler.callback(fragment);
            return true;
          }
        });
        return matched;
      },
  
      // Save a fragment into the hash history, or replace the URL state if the
      // 'replace' option is passed. You are responsible for properly URL-encoding
      // the fragment in advance.
      //
      // The options object can contain `trigger: true` if you wish to have the
      // route callback be fired (not usually desirable), or `replace: true`, if
      // you wish to modify the current URL without adding an entry to the history.
      navigate: function(fragment, options) {
        if (!History.started) return false;
        if (!options || options === true) options = {trigger: options};
        var frag = (fragment || '').replace(routeStripper, '');
        if (this.fragment == frag) return;
  
        // If pushState is available, we use it to set the fragment as a real URL.
        if (this._hasPushState) {
          if (frag.indexOf(this.options.root) != 0) frag = this.options.root + frag;
          this.fragment = frag;
          window.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, frag);
  
        // If hash changes haven't been explicitly disabled, update the hash
        // fragment to store history.
        } else if (this._wantsHashChange) {
          this.fragment = frag;
          this._updateHash(window.location, frag, options.replace);
          if (this.iframe && (frag != this.getFragment(this.getHash(this.iframe)))) {
            // Opening and closing the iframe tricks IE7 and earlier to push a history entry on hash-tag change.
            // When replace is true, we don't want this.
            if(!options.replace) this.iframe.document.open().close();
            this._updateHash(this.iframe.location, frag, options.replace);
          }
  
        // If you've told us that you explicitly don't want fallback hashchange-
        // based history, then `navigate` becomes a page refresh.
        } else {
          window.location.assign(this.options.root + fragment);
        }
        if (options.trigger) this.loadUrl(fragment);
      },
  
      // Update the hash location, either replacing the current entry, or adding
      // a new one to the browser history.
      _updateHash: function(location, fragment, replace) {
        if (replace) {
          location.replace(location.toString().replace(/(javascript:|#).*$/, '') + '#' + fragment);
        } else {
          location.hash = fragment;
        }
      }
    });
  
    // Backbone.View
    // -------------
  
    // Creating a Backbone.View creates its initial element outside of the DOM,
    // if an existing element is not provided...
    var View = Backbone.View = function(options) {
      this.cid = _.uniqueId('view');
      this._configure(options || {});
      this._ensureElement();
      this.initialize.apply(this, arguments);
      this.delegateEvents();
    };
  
    // Cached regex to split keys for `delegate`.
    var delegateEventSplitter = /^(\S+)\s*(.*)$/;
  
    // List of view options to be merged as properties.
    var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName'];
  
    // Set up all inheritable **Backbone.View** properties and methods.
    _.extend(View.prototype, Events, {
  
      // The default `tagName` of a View's element is `"div"`.
      tagName: 'div',
  
      // jQuery delegate for element lookup, scoped to DOM elements within the
      // current view. This should be prefered to global lookups where possible.
      $: function(selector) {
        return this.$el.find(selector);
      },
  
      // Initialize is an empty function by default. Override it with your own
      // initialization logic.
      initialize: function(){},
  
      // **render** is the core function that your view should override, in order
      // to populate its element (`this.el`), with the appropriate HTML. The
      // convention is for **render** to always return `this`.
      render: function() {
        return this;
      },
  
      // Remove this view from the DOM. Note that the view isn't present in the
      // DOM by default, so calling this method may be a no-op.
      remove: function() {
        this.$el.remove();
        return this;
      },
  
      // For small amounts of DOM Elements, where a full-blown template isn't
      // needed, use **make** to manufacture elements, one at a time.
      //
      //     var el = this.make('li', {'class': 'row'}, this.model.escape('title'));
      //
      make: function(tagName, attributes, content) {
        var el = document.createElement(tagName);
        if (attributes) $(el).attr(attributes);
        if (content) $(el).html(content);
        return el;
      },
  
      // Change the view's element (`this.el` property), including event
      // re-delegation.
      setElement: function(element, delegate) {
        if (this.$el) this.undelegateEvents();
        this.$el = (element instanceof $) ? element : $(element);
        this.el = this.$el[0];
        if (delegate !== false) this.delegateEvents();
        return this;
      },
  
      // Set callbacks, where `this.events` is a hash of
      //
      // *{"event selector": "callback"}*
      //
      //     {
      //       'mousedown .title':  'edit',
      //       'click .button':     'save'
      //       'click .open':       function(e) { ... }
      //     }
      //
      // pairs. Callbacks will be bound to the view, with `this` set properly.
      // Uses event delegation for efficiency.
      // Omitting the selector binds the event to `this.el`.
      // This only works for delegate-able events: not `focus`, `blur`, and
      // not `change`, `submit`, and `reset` in Internet Explorer.
      delegateEvents: function(events) {
        if (!(events || (events = getValue(this, 'events')))) return;
        this.undelegateEvents();
        for (var key in events) {
          var method = events[key];
          if (!_.isFunction(method)) method = this[events[key]];
          if (!method) throw new Error('Method "' + events[key] + '" does not exist');
          var match = key.match(delegateEventSplitter);
          var eventName = match[1], selector = match[2];
          method = _.bind(method, this);
          eventName += '.delegateEvents' + this.cid;
          if (selector === '') {
            this.$el.bind(eventName, method);
          } else {
            this.$el.delegate(selector, eventName, method);
          }
        }
      },
  
      // Clears all callbacks previously bound to the view with `delegateEvents`.
      // You usually don't need to use this, but may wish to if you have multiple
      // Backbone views attached to the same DOM element.
      undelegateEvents: function() {
        this.$el.unbind('.delegateEvents' + this.cid);
      },
  
      // Performs the initial configuration of a View with a set of options.
      // Keys with special meaning *(model, collection, id, className)*, are
      // attached directly to the view.
      _configure: function(options) {
        if (this.options) options = _.extend({}, this.options, options);
        for (var i = 0, l = viewOptions.length; i < l; i++) {
          var attr = viewOptions[i];
          if (options[attr]) this[attr] = options[attr];
        }
        this.options = options;
      },
  
      // Ensure that the View has a DOM element to render into.
      // If `this.el` is a string, pass it through `$()`, take the first
      // matching element, and re-assign it to `el`. Otherwise, create
      // an element from the `id`, `className` and `tagName` properties.
      _ensureElement: function() {
        if (!this.el) {
          var attrs = getValue(this, 'attributes') || {};
          if (this.id) attrs.id = this.id;
          if (this.className) attrs['class'] = this.className;
          this.setElement(this.make(this.tagName, attrs), false);
        } else {
          this.setElement(this.el, false);
        }
      }
  
    });
  
    // The self-propagating extend function that Backbone classes use.
    var extend = function (protoProps, classProps) {
      var child = inherits(this, protoProps, classProps);
      child.extend = this.extend;
      return child;
    };
  
    // Set up inheritance for the model, collection, and view.
    Model.extend = Collection.extend = Router.extend = View.extend = extend;
  
    // Backbone.sync
    // -------------
  
    // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
    var methodMap = {
      'create': 'POST',
      'update': 'PUT',
      'delete': 'DELETE',
      'read':   'GET'
    };
  
    // Override this function to change the manner in which Backbone persists
    // models to the server. You will be passed the type of request, and the
    // model in question. By default, makes a RESTful Ajax request
    // to the model's `url()`. Some possible customizations could be:
    //
    // * Use `setTimeout` to batch rapid-fire updates into a single request.
    // * Send up the models as XML instead of JSON.
    // * Persist models via WebSockets instead of Ajax.
    //
    // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
    // as `POST`, with a `_method` parameter containing the true HTTP method,
    // as well as all requests with the body as `application/x-www-form-urlencoded`
    // instead of `application/json` with the model in a param named `model`.
    // Useful when interfacing with server-side languages like **PHP** that make
    // it difficult to read the body of `PUT` requests.
    Backbone.sync = function(method, model, options) {
      var type = methodMap[method];
  
      // Default options, unless specified.
      options || (options = {});
  
      // Default JSON-request options.
      var params = {type: type, dataType: 'json'};
  
      // Ensure that we have a URL.
      if (!options.url) {
        params.url = getValue(model, 'url') || urlError();
      }
  
      // Ensure that we have the appropriate request data.
      if (!options.data && model && (method == 'create' || method == 'update')) {
        params.contentType = 'application/json';
        params.data = JSON.stringify(model.toJSON());
      }
  
      // For older servers, emulate JSON by encoding the request into an HTML-form.
      if (Backbone.emulateJSON) {
        params.contentType = 'application/x-www-form-urlencoded';
        params.data = params.data ? {model: params.data} : {};
      }
  
      // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
      // And an `X-HTTP-Method-Override` header.
      if (Backbone.emulateHTTP) {
        if (type === 'PUT' || type === 'DELETE') {
          if (Backbone.emulateJSON) params.data._method = type;
          params.type = 'POST';
          params.beforeSend = function(xhr) {
            xhr.setRequestHeader('X-HTTP-Method-Override', type);
          };
        }
      }
  
      // Don't process data on a non-GET request.
      if (params.type !== 'GET' && !Backbone.emulateJSON) {
        params.processData = false;
      }
  
      // Make the request, allowing the user to override any Ajax options.
      return $.ajax(_.extend(params, options));
    };
  
    // Wrap an optional error callback with a fallback error event.
    Backbone.wrapError = function(onError, originalModel, options) {
      return function(model, resp) {
        resp = model === originalModel ? resp : model;
        if (onError) {
          onError(originalModel, resp, options);
        } else {
          originalModel.trigger('error', originalModel, resp, options);
        }
      };
    };
  
    // Helpers
    // -------
  
    // Shared empty constructor function to aid in prototype-chain creation.
    var ctor = function(){};
  
    // Helper function to correctly set up the prototype chain, for subclasses.
    // Similar to `goog.inherits`, but uses a hash of prototype properties and
    // class properties to be extended.
    var inherits = function(parent, protoProps, staticProps) {
      var child;
  
      // The constructor function for the new subclass is either defined by you
      // (the "constructor" property in your `extend` definition), or defaulted
      // by us to simply call the parent's constructor.
      if (protoProps && protoProps.hasOwnProperty('constructor')) {
        child = protoProps.constructor;
      } else {
        child = function(){ parent.apply(this, arguments); };
      }
  
      // Inherit class (static) properties from parent.
      _.extend(child, parent);
  
      // Set the prototype chain to inherit from `parent`, without calling
      // `parent`'s constructor function.
      ctor.prototype = parent.prototype;
      child.prototype = new ctor();
  
      // Add prototype properties (instance properties) to the subclass,
      // if supplied.
      if (protoProps) _.extend(child.prototype, protoProps);
  
      // Add static properties to the constructor function, if supplied.
      if (staticProps) _.extend(child, staticProps);
  
      // Correctly set child's `prototype.constructor`.
      child.prototype.constructor = child;
  
      // Set a convenience property in case the parent's prototype is needed later.
      child.__super__ = parent.prototype;
  
      return child;
    };
  
    // Helper function to get a value from a Backbone object as a property
    // or as a function.
    var getValue = function(object, prop) {
      if (!(object && object[prop])) return null;
      return _.isFunction(object[prop]) ? object[prop]() : object[prop];
    };
  
    // Throw an error when a URL is needed, and none is supplied.
    var urlError = function() {
      throw new Error('A "url" property or function must be specified');
    };
  
  }).call(this);
  

  provide("backbone", module.exports);

  $.ender(module.exports);

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /*!
    * bean.js - copyright Jacob Thornton 2011
    * https://github.com/fat/bean
    * MIT License
    * special thanks to:
    * dean edwards: http://dean.edwards.name/
    * dperini: https://github.com/dperini/nwevents
    * the entire mootools team: github.com/mootools/mootools-core
    */
  !function (name, context, definition) {
    if (typeof module !== 'undefined') module.exports = definition(name, context);
    else if (typeof define === 'function' && typeof define.amd  === 'object') define(definition);
    else context[name] = definition(name, context);
  }('bean', this, function (name, context) {
    var win = window
      , old = context[name]
      , overOut = /over|out/
      , namespaceRegex = /[^\.]*(?=\..*)\.|.*/
      , nameRegex = /\..*/
      , addEvent = 'addEventListener'
      , attachEvent = 'attachEvent'
      , removeEvent = 'removeEventListener'
      , detachEvent = 'detachEvent'
      , ownerDocument = 'ownerDocument'
      , targetS = 'target'
      , qSA = 'querySelectorAll'
      , doc = document || {}
      , root = doc.documentElement || {}
      , W3C_MODEL = root[addEvent]
      , eventSupport = W3C_MODEL ? addEvent : attachEvent
      , slice = Array.prototype.slice
      , mouseTypeRegex = /click|mouse(?!(.*wheel|scroll))|menu|drag|drop/i
      , mouseWheelTypeRegex = /mouse.*(wheel|scroll)/i
      , textTypeRegex = /^text/i
      , touchTypeRegex = /^touch|^gesture/i
      , ONE = {} // singleton for quick matching making add() do one()
  
      , nativeEvents = (function (hash, events, i) {
          for (i = 0; i < events.length; i++)
            hash[events[i]] = 1
          return hash
        }({}, (
            'click dblclick mouseup mousedown contextmenu ' +                  // mouse buttons
            'mousewheel mousemultiwheel DOMMouseScroll ' +                     // mouse wheel
            'mouseover mouseout mousemove selectstart selectend ' +            // mouse movement
            'keydown keypress keyup ' +                                        // keyboard
            'orientationchange ' +                                             // mobile
            'focus blur change reset select submit ' +                         // form elements
            'load unload beforeunload resize move DOMContentLoaded '+          // window
            'readystatechange message ' +                                      // window
            'error abort scroll ' +                                            // misc
            (W3C_MODEL ? // element.fireEvent('onXYZ'... is not forgiving if we try to fire an event
                         // that doesn't actually exist, so make sure we only do these on newer browsers
              'show ' +                                                          // mouse buttons
              'input invalid ' +                                                 // form elements
              'touchstart touchmove touchend touchcancel ' +                     // touch
              'gesturestart gesturechange gestureend ' +                         // gesture
              'readystatechange pageshow pagehide popstate ' +                   // window
              'hashchange offline online ' +                                     // window
              'afterprint beforeprint ' +                                        // printing
              'dragstart dragenter dragover dragleave drag drop dragend ' +      // dnd
              'loadstart progress suspend emptied stalled loadmetadata ' +       // media
              'loadeddata canplay canplaythrough playing waiting seeking ' +     // media
              'seeked ended durationchange timeupdate play pause ratechange ' +  // media
              'volumechange cuechange ' +                                        // media
              'checking noupdate downloading cached updateready obsolete ' +     // appcache
              '' : '')
          ).split(' ')
        ))
  
      , customEvents = (function () {
          var cdp = 'compareDocumentPosition'
            , isAncestor = cdp in root
                ? function (element, container) {
                    return container[cdp] && (container[cdp](element) & 16) === 16
                  }
                : 'contains' in root
                  ? function (element, container) {
                      container = container.nodeType === 9 || container === window ? root : container
                      return container !== element && container.contains(element)
                    }
                  : function (element, container) {
                      while (element = element.parentNode) if (element === container) return 1
                      return 0
                    }
  
          function check(event) {
            var related = event.relatedTarget
            return !related
              ? related === null
              : (related !== this && related.prefix !== 'xul' && !/document/.test(this.toString()) && !isAncestor(related, this))
          }
  
          return {
              mouseenter: { base: 'mouseover', condition: check }
            , mouseleave: { base: 'mouseout', condition: check }
            , mousewheel: { base: /Firefox/.test(navigator.userAgent) ? 'DOMMouseScroll' : 'mousewheel' }
          }
        }())
  
      , fixEvent = (function () {
          var commonProps = 'altKey attrChange attrName bubbles cancelable ctrlKey currentTarget detail eventPhase getModifierState isTrusted metaKey relatedNode relatedTarget shiftKey srcElement target timeStamp type view which'.split(' ')
            , mouseProps = commonProps.concat('button buttons clientX clientY dataTransfer fromElement offsetX offsetY pageX pageY screenX screenY toElement'.split(' '))
            , mouseWheelProps = mouseProps.concat('wheelDelta wheelDeltaX wheelDeltaY wheelDeltaZ axis'.split(' ')) // 'axis' is FF specific
            , keyProps = commonProps.concat('char charCode key keyCode keyIdentifier keyLocation'.split(' '))
            , textProps = commonProps.concat(['data'])
            , touchProps = commonProps.concat('touches targetTouches changedTouches scale rotation'.split(' '))
            , messageProps = commonProps.concat(['data', 'origin', 'source'])
            , preventDefault = 'preventDefault'
            , createPreventDefault = function (event) {
                return function () {
                  if (event[preventDefault])
                    event[preventDefault]()
                  else
                    event.returnValue = false
                }
              }
            , stopPropagation = 'stopPropagation'
            , createStopPropagation = function (event) {
                return function () {
                  if (event[stopPropagation])
                    event[stopPropagation]()
                  else
                    event.cancelBubble = true
                }
              }
            , createStop = function (synEvent) {
                return function () {
                  synEvent[preventDefault]()
                  synEvent[stopPropagation]()
                  synEvent.stopped = true
                }
              }
            , copyProps = function (event, result, props) {
                var i, p
                for (i = props.length; i--;) {
                  p = props[i]
                  if (!(p in result) && p in event) result[p] = event[p]
                }
              }
  
          return function (event, isNative) {
            var result = { originalEvent: event, isNative: isNative }
            if (!event)
              return result
  
            var props
              , type = event.type
              , target = event[targetS] || event.srcElement
  
            result[preventDefault] = createPreventDefault(event)
            result[stopPropagation] = createStopPropagation(event)
            result.stop = createStop(result)
            result[targetS] = target && target.nodeType === 3 ? target.parentNode : target
  
            if (isNative) { // we only need basic augmentation on custom events, the rest is too expensive
              if (type.indexOf('key') !== -1) {
                props = keyProps
                result.keyCode = event.keyCode || event.which
              } else if (mouseTypeRegex.test(type)) {
                props = mouseProps
                result.rightClick = event.which === 3 || event.button === 2
                result.pos = { x: 0, y: 0 }
                if (event.pageX || event.pageY) {
                  result.clientX = event.pageX
                  result.clientY = event.pageY
                } else if (event.clientX || event.clientY) {
                  result.clientX = event.clientX + doc.body.scrollLeft + root.scrollLeft
                  result.clientY = event.clientY + doc.body.scrollTop + root.scrollTop
                }
                if (overOut.test(type))
                  result.relatedTarget = event.relatedTarget || event[(type === 'mouseover' ? 'from' : 'to') + 'Element']
              } else if (touchTypeRegex.test(type)) {
                props = touchProps
              } else if (mouseWheelTypeRegex.test(type)) {
                props = mouseWheelProps
              } else if (textTypeRegex.test(type)) {
                props = textProps
              } else if (type === 'message') {
                props = messageProps
              }
              copyProps(event, result, props || commonProps)
            }
            return result
          }
        }())
  
        // if we're in old IE we can't do onpropertychange on doc or win so we use doc.documentElement for both
      , targetElement = function (element, isNative) {
          return !W3C_MODEL && !isNative && (element === doc || element === win) ? root : element
        }
  
        // we use one of these per listener, of any type
      , RegEntry = (function () {
          function entry(element, type, handler, original, namespaces) {
            var isNative = this.isNative = nativeEvents[type] && element[eventSupport]
            this.element = element
            this.type = type
            this.handler = handler
            this.original = original
            this.namespaces = namespaces
            this.custom = customEvents[type]
            this.eventType = W3C_MODEL || isNative ? type : 'propertychange'
            this.customType = !W3C_MODEL && !isNative && type
            this[targetS] = targetElement(element, isNative)
            this[eventSupport] = this[targetS][eventSupport]
          }
  
          entry.prototype = {
              // given a list of namespaces, is our entry in any of them?
              inNamespaces: function (checkNamespaces) {
                var i, j
                if (!checkNamespaces)
                  return true
                if (!this.namespaces)
                  return false
                for (i = checkNamespaces.length; i--;) {
                  for (j = this.namespaces.length; j--;) {
                    if (checkNamespaces[i] === this.namespaces[j])
                      return true
                  }
                }
                return false
              }
  
              // match by element, original fn (opt), handler fn (opt)
            , matches: function (checkElement, checkOriginal, checkHandler) {
                return this.element === checkElement &&
                  (!checkOriginal || this.original === checkOriginal) &&
                  (!checkHandler || this.handler === checkHandler)
              }
          }
  
          return entry
        }())
  
      , registry = (function () {
          // our map stores arrays by event type, just because it's better than storing
          // everything in a single array. uses '$' as a prefix for the keys for safety
          var map = {}
  
            // generic functional search of our registry for matching listeners,
            // `fn` returns false to break out of the loop
            , forAll = function (element, type, original, handler, fn) {
                if (!type || type === '*') {
                  // search the whole registry
                  for (var t in map) {
                    if (t.charAt(0) === '$')
                      forAll(element, t.substr(1), original, handler, fn)
                  }
                } else {
                  var i = 0, l, list = map['$' + type], all = element === '*'
                  if (!list)
                    return
                  for (l = list.length; i < l; i++) {
                    if (all || list[i].matches(element, original, handler))
                      if (!fn(list[i], list, i, type))
                        return
                  }
                }
              }
  
            , has = function (element, type, original) {
                // we're not using forAll here simply because it's a bit slower and this
                // needs to be fast
                var i, list = map['$' + type]
                if (list) {
                  for (i = list.length; i--;) {
                    if (list[i].matches(element, original, null))
                      return true
                  }
                }
                return false
              }
  
            , get = function (element, type, original) {
                var entries = []
                forAll(element, type, original, null, function (entry) { return entries.push(entry) })
                return entries
              }
  
            , put = function (entry) {
                (map['$' + entry.type] || (map['$' + entry.type] = [])).push(entry)
                return entry
              }
  
            , del = function (entry) {
                forAll(entry.element, entry.type, null, entry.handler, function (entry, list, i) {
                  list.splice(i, 1)
                  if (list.length === 0)
                    delete map['$' + entry.type]
                  return false
                })
              }
  
              // dump all entries, used for onunload
            , entries = function () {
                var t, entries = []
                for (t in map) {
                  if (t.charAt(0) === '$')
                    entries = entries.concat(map[t])
                }
                return entries
              }
  
          return { has: has, get: get, put: put, del: del, entries: entries }
        }())
  
      , selectorEngine = doc[qSA]
          ? function (s, r) {
              return r[qSA](s)
            }
          : function () {
              throw new Error('Bean: No selector engine installed') // eeek
            }
  
      , setSelectorEngine = function (e) {
          selectorEngine = e
        }
  
        // add and remove listeners to DOM elements
      , listener = W3C_MODEL ? function (element, type, fn, add) {
          element[add ? addEvent : removeEvent](type, fn, false)
        } : function (element, type, fn, add, custom) {
          if (custom && add && element['_on' + custom] === null)
            element['_on' + custom] = 0
          element[add ? attachEvent : detachEvent]('on' + type, fn)
        }
  
      , nativeHandler = function (element, fn, args) {
          var beanDel = fn.__beanDel
            , handler = function (event) {
            event = fixEvent(event || ((this[ownerDocument] || this.document || this).parentWindow || win).event, true)
            if (beanDel) // delegated event, fix the fix
              event.currentTarget = beanDel.ft(event[targetS], element)
            return fn.apply(element, [event].concat(args))
          }
          handler.__beanDel = beanDel
          return handler
        }
  
      , customHandler = function (element, fn, type, condition, args, isNative) {
          var beanDel = fn.__beanDel
            , handler = function (event) {
            var target = beanDel ? beanDel.ft(event[targetS], element) : this // deleated event
            if (condition ? condition.apply(target, arguments) : W3C_MODEL ? true : event && event.propertyName === '_on' + type || !event) {
              if (event) {
                event = fixEvent(event || ((this[ownerDocument] || this.document || this).parentWindow || win).event, isNative)
                event.currentTarget = target
              }
              fn.apply(element, event && (!args || args.length === 0) ? arguments : slice.call(arguments, event ? 0 : 1).concat(args))
            }
          }
          handler.__beanDel = beanDel
          return handler
        }
  
      , once = function (rm, element, type, fn, originalFn) {
          // wrap the handler in a handler that does a remove as well
          return function () {
            rm(element, type, originalFn)
            fn.apply(this, arguments)
          }
        }
  
      , removeListener = function (element, orgType, handler, namespaces) {
          var i, l, entry
            , type = (orgType && orgType.replace(nameRegex, ''))
            , handlers = registry.get(element, type, handler)
  
          for (i = 0, l = handlers.length; i < l; i++) {
            if (handlers[i].inNamespaces(namespaces)) {
              if ((entry = handlers[i])[eventSupport])
                listener(entry[targetS], entry.eventType, entry.handler, false, entry.type)
              // TODO: this is problematic, we have a registry.get() and registry.del() that
              // both do registry searches so we waste cycles doing this. Needs to be rolled into
              // a single registry.forAll(fn) that removes while finding, but the catch is that
              // we'll be splicing the arrays that we're iterating over. Needs extra tests to
              // make sure we don't screw it up. @rvagg
              registry.del(entry)
            }
          }
        }
  
      , addListener = function (element, orgType, fn, originalFn, args) {
          var entry
            , type = orgType.replace(nameRegex, '')
            , namespaces = orgType.replace(namespaceRegex, '').split('.')
  
          if (registry.has(element, type, fn))
            return element // no dupe
          if (type === 'unload')
            fn = once(removeListener, element, type, fn, originalFn) // self clean-up
          if (customEvents[type]) {
            if (customEvents[type].condition)
              fn = customHandler(element, fn, type, customEvents[type].condition, args, true)
            type = customEvents[type].base || type
          }
          entry = registry.put(new RegEntry(element, type, fn, originalFn, namespaces[0] && namespaces))
          entry.handler = entry.isNative ?
            nativeHandler(element, entry.handler, args) :
            customHandler(element, entry.handler, type, false, args, false)
          if (entry[eventSupport])
            listener(entry[targetS], entry.eventType, entry.handler, true, entry.customType)
        }
  
      , del = function (selector, fn, $) {
              //TODO: findTarget (therefore $) is called twice, once for match and once for
              // setting e.currentTarget, fix this so it's only needed once
          var findTarget = function (target, root) {
                var i, array = typeof selector === 'string' ? $(selector, root) : selector
                for (; target && target !== root; target = target.parentNode) {
                  for (i = array.length; i--;) {
                    if (array[i] === target)
                      return target
                  }
                }
              }
            , handler = function (e) {
                var match = findTarget(e[targetS], this)
                match && fn.apply(match, arguments)
              }
  
          handler.__beanDel = {
              ft: findTarget // attach it here for customEvents to use too
            , selector: selector
            , $: $
          }
          return handler
        }
  
      , remove = function (element, typeSpec, fn) {
          var k, type, namespaces, i
            , rm = removeListener
            , isString = typeSpec && typeof typeSpec === 'string'
  
          if (isString && typeSpec.indexOf(' ') > 0) {
            // remove(el, 't1 t2 t3', fn) or remove(el, 't1 t2 t3')
            typeSpec = typeSpec.split(' ')
            for (i = typeSpec.length; i--;)
              remove(element, typeSpec[i], fn)
            return element
          }
          type = isString && typeSpec.replace(nameRegex, '')
          if (type && customEvents[type])
            type = customEvents[type].type
          if (!typeSpec || isString) {
            // remove(el) or remove(el, t1.ns) or remove(el, .ns) or remove(el, .ns1.ns2.ns3)
            if (namespaces = isString && typeSpec.replace(namespaceRegex, ''))
              namespaces = namespaces.split('.')
            rm(element, type, fn, namespaces)
          } else if (typeof typeSpec === 'function') {
            // remove(el, fn)
            rm(element, null, typeSpec)
          } else {
            // remove(el, { t1: fn1, t2, fn2 })
            for (k in typeSpec) {
              if (typeSpec.hasOwnProperty(k))
                remove(element, k, typeSpec[k])
            }
          }
          return element
        }
  
        // 5th argument, $=selector engine, is deprecated and will be removed
      , add = function (element, events, fn, delfn, $) {
          var type, types, i, args
            , originalFn = fn
            , isDel = fn && typeof fn === 'string'
  
          if (events && !fn && typeof events === 'object') {
            for (type in events) {
              if (events.hasOwnProperty(type))
                add.apply(this, [ element, type, events[type] ])
            }
          } else {
            args = arguments.length > 3 ? slice.call(arguments, 3) : []
            types = (isDel ? fn : events).split(' ')
            isDel && (fn = del(events, (originalFn = delfn), $ || selectorEngine)) && (args = slice.call(args, 1))
            // special case for one()
            this === ONE && (fn = once(remove, element, events, fn, originalFn))
            for (i = types.length; i--;) addListener(element, types[i], fn, originalFn, args)
          }
          return element
        }
  
      , one = function () {
          return add.apply(ONE, arguments)
        }
  
      , fireListener = W3C_MODEL ? function (isNative, type, element) {
          var evt = doc.createEvent(isNative ? 'HTMLEvents' : 'UIEvents')
          evt[isNative ? 'initEvent' : 'initUIEvent'](type, true, true, win, 1)
          element.dispatchEvent(evt)
        } : function (isNative, type, element) {
          element = targetElement(element, isNative)
          // if not-native then we're using onpropertychange so we just increment a custom property
          isNative ? element.fireEvent('on' + type, doc.createEventObject()) : element['_on' + type]++
        }
  
      , fire = function (element, type, args) {
          var i, j, l, names, handlers
            , types = type.split(' ')
  
          for (i = types.length; i--;) {
            type = types[i].replace(nameRegex, '')
            if (names = types[i].replace(namespaceRegex, ''))
              names = names.split('.')
            if (!names && !args && element[eventSupport]) {
              fireListener(nativeEvents[type], type, element)
            } else {
              // non-native event, either because of a namespace, arguments or a non DOM element
              // iterate over all listeners and manually 'fire'
              handlers = registry.get(element, type)
              args = [false].concat(args)
              for (j = 0, l = handlers.length; j < l; j++) {
                if (handlers[j].inNamespaces(names))
                  handlers[j].handler.apply(element, args)
              }
            }
          }
          return element
        }
  
      , clone = function (element, from, type) {
          var i = 0
            , handlers = registry.get(from, type)
            , l = handlers.length
            , args, beanDel
  
          for (;i < l; i++) {
            if (handlers[i].original) {
              beanDel = handlers[i].handler.__beanDel
              if (beanDel) {
                args = [ element, beanDel.selector, handlers[i].type, handlers[i].original, beanDel.$]
              } else
                args = [ element, handlers[i].type, handlers[i].original ]
              add.apply(null, args)
            }
          }
          return element
        }
  
      , bean = {
            add: add
          , one: one
          , remove: remove
          , clone: clone
          , fire: fire
          , setSelectorEngine: setSelectorEngine
          , noConflict: function () {
              context[name] = old
              return this
            }
        }
  
    if (win[attachEvent]) {
      // for IE, clean up on unload to avoid leaks
      var cleanup = function () {
        var i, entries = registry.entries()
        for (i in entries) {
          if (entries[i].type && entries[i].type !== 'unload')
            remove(entries[i].element, entries[i].type)
        }
        win[detachEvent]('onunload', cleanup)
        win.CollectGarbage && win.CollectGarbage()
      }
      win[attachEvent]('onunload', cleanup)
    }
  
    return bean
  })
  

  provide("bean", module.exports);

  !function ($) {
    var b = require('bean')
      , integrate = function (method, type, method2) {
          var _args = type ? [type] : []
          return function () {
            for (var i = 0, l = this.length; i < l; i++) {
              if (!arguments.length && method == 'add' && type) method = 'fire'
              b[method].apply(this, [this[i]].concat(_args, Array.prototype.slice.call(arguments, 0)))
            }
            return this
          }
        }
      , add = integrate('add')
      , remove = integrate('remove')
      , fire = integrate('fire')
  
      , methods = {
            on: add // NOTE: .on() is likely to change in the near future, don't rely on this as-is see https://github.com/fat/bean/issues/55
          , addListener: add
          , bind: add
          , listen: add
          , delegate: add
  
          , one: integrate('one')
  
          , off: remove
          , unbind: remove
          , unlisten: remove
          , removeListener: remove
          , undelegate: remove
  
          , emit: fire
          , trigger: fire
  
          , cloneEvents: integrate('clone')
  
          , hover: function (enter, leave, i) { // i for internal
              for (i = this.length; i--;) {
                b.add.call(this, this[i], 'mouseenter', enter)
                b.add.call(this, this[i], 'mouseleave', leave)
              }
              return this
            }
        }
  
      , shortcuts =
           ('blur change click dblclick error focus focusin focusout keydown keypress '
          + 'keyup load mousedown mouseenter mouseleave mouseout mouseover mouseup '
          + 'mousemove resize scroll select submit unload').split(' ')
  
    for (var i = shortcuts.length; i--;) {
      methods[shortcuts[i]] = integrate('add', shortcuts[i])
    }
  
    b.setSelectorEngine($)
  
    $.ender(methods, true)
  }(ender)
  

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /*!
    * Bonzo: DOM Utility (c) Dustin Diaz 2012
    * https://github.com/ded/bonzo
    * License MIT
    */
  (function (name, definition, context) {
    if (typeof module != 'undefined' && module.exports) module.exports = definition()
    else if (typeof context['define'] != 'undefined' && context['define'] == 'function' && context['define']['amd']) define(name, definition)
    else context[name] = definition()
  })('bonzo', function() {
    var context = this
      , win = window
      , doc = win.document
      , html = doc.documentElement
      , parentNode = 'parentNode'
      , query = null
      , specialAttributes = /^(checked|value|selected)$/i
      , specialTags = /^(select|fieldset|table|tbody|tfoot|td|tr|colgroup)$/i // tags that we have trouble inserting *into*
      , table = ['<table>', '</table>', 1]
      , td = ['<table><tbody><tr>', '</tr></tbody></table>', 3]
      , option = ['<select>', '</select>', 1]
      , noscope = ['_', '', 0, 1]
      , tagMap = { // tags that we have trouble *inserting*
            thead: table, tbody: table, tfoot: table, colgroup: table, caption: table
          , tr: ['<table><tbody>', '</tbody></table>', 2]
          , th: td , td: td
          , col: ['<table><colgroup>', '</colgroup></table>', 2]
          , fieldset: ['<form>', '</form>', 1]
          , legend: ['<form><fieldset>', '</fieldset></form>', 2]
          , option: option, optgroup: option
          , script: noscope, style: noscope, link: noscope, param: noscope, base: noscope
        }
      , stateAttributes = /^(checked|selected)$/
      , ie = /msie/i.test(navigator.userAgent)
      , hasClass, addClass, removeClass
      , uidMap = {}
      , uuids = 0
      , digit = /^-?[\d\.]+$/
      , dattr = /^data-(.+)$/
      , px = 'px'
      , setAttribute = 'setAttribute'
      , getAttribute = 'getAttribute'
      , byTag = 'getElementsByTagName'
      , features = function() {
          var e = doc.createElement('p')
          e.innerHTML = '<a href="#x">x</a><table style="float:left;"></table>'
          return {
            hrefExtended: e[byTag]('a')[0][getAttribute]('href') != '#x' // IE < 8
          , autoTbody: e[byTag]('tbody').length !== 0 // IE < 8
          , computedStyle: doc.defaultView && doc.defaultView.getComputedStyle
          , cssFloat: e[byTag]('table')[0].style.styleFloat ? 'styleFloat' : 'cssFloat'
          , transform: function () {
              var props = ['webkitTransform', 'MozTransform', 'OTransform', 'msTransform', 'Transform'], i
              for (i = 0; i < props.length; i++) {
                if (props[i] in e.style) return props[i]
              }
            }()
          , classList: 'classList' in e
          }
        }()
      , trimReplace = /(^\s*|\s*$)/g
      , whitespaceRegex = /\s+/
      , toString = String.prototype.toString
      , unitless = { lineHeight: 1, zoom: 1, zIndex: 1, opacity: 1, boxFlex: 1, WebkitBoxFlex: 1, MozBoxFlex: 1 }
      , trim = String.prototype.trim ?
          function (s) {
            return s.trim()
          } :
          function (s) {
            return s.replace(trimReplace, '')
          }
  
    function classReg(c) {
      return new RegExp("(^|\\s+)" + c + "(\\s+|$)")
    }
  
    function each(ar, fn, scope) {
      for (var i = 0, l = ar.length; i < l; i++) fn.call(scope || ar[i], ar[i], i, ar)
      return ar
    }
  
    function deepEach(ar, fn, scope) {
      for (var i = 0, l = ar.length; i < l; i++) {
        if (isNode(ar[i])) {
          deepEach(ar[i].childNodes, fn, scope)
          fn.call(scope || ar[i], ar[i], i, ar)
        }
      }
      return ar
    }
  
    function camelize(s) {
      return s.replace(/-(.)/g, function (m, m1) {
        return m1.toUpperCase()
      })
    }
  
    function decamelize(s) {
      return s ? s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() : s
    }
  
    function data(el) {
      el[getAttribute]('data-node-uid') || el[setAttribute]('data-node-uid', ++uuids)
      var uid = el[getAttribute]('data-node-uid')
      return uidMap[uid] || (uidMap[uid] = {})
    }
  
    function clearData(el) {
      var uid = el[getAttribute]('data-node-uid')
      if (uid) delete uidMap[uid]
    }
  
    function dataValue(d, f) {
      try {
        return (d === null || d === undefined) ? undefined :
          d === 'true' ? true :
            d === 'false' ? false :
              d === 'null' ? null :
                (f = parseFloat(d)) == d ? f : d;
      } catch(e) {}
      return undefined
    }
  
    function isNode(node) {
      return node && node.nodeName && node.nodeType == 1
    }
  
    function some(ar, fn, scope, i, j) {
      for (i = 0, j = ar.length; i < j; ++i) if (fn.call(scope, ar[i], i, ar)) return true
      return false
    }
  
    function styleProperty(p) {
        (p == 'transform' && (p = features.transform)) ||
          (/^transform-?[Oo]rigin$/.test(p) && (p = features.transform + "Origin")) ||
          (p == 'float' && (p = features.cssFloat))
        return p ? camelize(p) : null
    }
  
    var getStyle = features.computedStyle ?
      function (el, property) {
        var value = null
          , computed = doc.defaultView.getComputedStyle(el, '')
        computed && (value = computed[property])
        return el.style[property] || value
      } :
  
      (ie && html.currentStyle) ?
  
      function (el, property) {
        if (property == 'opacity') {
          var val = 100
          try {
            val = el.filters['DXImageTransform.Microsoft.Alpha'].opacity
          } catch (e1) {
            try {
              val = el.filters('alpha').opacity
            } catch (e2) {}
          }
          return val / 100
        }
        var value = el.currentStyle ? el.currentStyle[property] : null
        return el.style[property] || value
      } :
  
      function (el, property) {
        return el.style[property]
      }
  
    // this insert method is intense
    function insert(target, host, fn) {
      var i = 0, self = host || this, r = []
        // target nodes could be a css selector if it's a string and a selector engine is present
        // otherwise, just use target
        , nodes = query && typeof target == 'string' && target.charAt(0) != '<' ? query(target) : target
      // normalize each node in case it's still a string and we need to create nodes on the fly
      each(normalize(nodes), function (t) {
        each(self, function (el) {
          var n = !el[parentNode] || (el[parentNode] && !el[parentNode][parentNode]) ?
            function () {
              var c = el.cloneNode(true)
                , cloneElems
                , elElems
  
              // check for existence of an event cloner
              // preferably https://github.com/fat/bean
              // otherwise Bonzo won't do this for you
              if (self.$ && self.cloneEvents) {
                self.$(c).cloneEvents(el)
  
                // clone events from every child node
                cloneElems = self.$(c).find('*')
                elElems = self.$(el).find('*')
  
                for (var i = 0; i < elElems.length; i++)
                  self.$(cloneElems[i]).cloneEvents(elElems[i])
              }
              return c
            }() : el
          fn(t, n)
          r[i] = n
          i++
        })
      }, this)
      each(r, function (e, i) {
        self[i] = e
      })
      self.length = i
      return self
    }
  
    function xy(el, x, y) {
      var $el = bonzo(el)
        , style = $el.css('position')
        , offset = $el.offset()
        , rel = 'relative'
        , isRel = style == rel
        , delta = [parseInt($el.css('left'), 10), parseInt($el.css('top'), 10)]
  
      if (style == 'static') {
        $el.css('position', rel)
        style = rel
      }
  
      isNaN(delta[0]) && (delta[0] = isRel ? 0 : el.offsetLeft)
      isNaN(delta[1]) && (delta[1] = isRel ? 0 : el.offsetTop)
  
      x != null && (el.style.left = x - offset.left + delta[0] + px)
      y != null && (el.style.top = y - offset.top + delta[1] + px)
  
    }
  
    // classList support for class management
    // altho to be fair, the api sucks because it won't accept multiple classes at once
    // so we iterate down below
    if (features.classList) {
      hasClass = function (el, c) {
        return el.classList.contains(c)
      }
      addClass = function (el, c) {
        el.classList.add(c)
      }
      removeClass = function (el, c) {
        el.classList.remove(c)
      }
    }
    else {
      hasClass = function (el, c) {
        return classReg(c).test(el.className)
      }
      addClass = function (el, c) {
        el.className = trim(el.className + ' ' + c)
      }
      removeClass = function (el, c) {
        el.className = trim(el.className.replace(classReg(c), ' '))
      }
    }
  
  
    // this allows method calling for setting values
    // example:
    // bonzo(elements).css('color', function (el) {
    //   return el.getAttribute('data-original-color')
    // })
    function setter(el, v) {
      return typeof v == 'function' ? v(el) : v
    }
  
    function Bonzo(elements) {
      this.length = 0
      if (elements) {
        elements = typeof elements !== 'string' &&
          !elements.nodeType &&
          typeof elements.length !== 'undefined' ?
            elements :
            [elements]
        this.length = elements.length
        for (var i = 0; i < elements.length; i++) this[i] = elements[i]
      }
    }
  
    Bonzo.prototype = {
  
        // indexr method, because jQueriers want this method. Jerks
        get: function (index) {
          return this[index] || null
        }
  
        // itetators
      , each: function (fn, scope) {
          return each(this, fn, scope)
        }
  
      , deepEach: function (fn, scope) {
          return deepEach(this, fn, scope)
        }
  
      , map: function (fn, reject) {
          var m = [], n, i
          for (i = 0; i < this.length; i++) {
            n = fn.call(this, this[i], i)
            reject ? (reject(n) && m.push(n)) : m.push(n)
          }
          return m
        }
  
      // text and html inserters!
      , html: function (h, text) {
          var method = text ?
            html.textContent === undefined ?
              'innerText' :
              'textContent' :
            'innerHTML';
          function append(el) {
            each(normalize(h), function (node) {
              el.appendChild(node)
            })
          }
          return typeof h !== 'undefined' ?
              this.empty().each(function (el) {
                !text && specialTags.test(el.tagName) ?
                  append(el) :
                  (function () {
                    try { (el[method] = h) }
                    catch(e) { append(el) }
                  }())
              }) :
            this[0] ? this[0][method] : ''
        }
  
      , text: function (text) {
          return this.html(text, 1)
        }
  
        // more related insertion methods
      , append: function (node) {
          return this.each(function (el) {
            each(normalize(node), function (i) {
              el.appendChild(i)
            })
          })
        }
  
      , prepend: function (node) {
          return this.each(function (el) {
            var first = el.firstChild
            each(normalize(node), function (i) {
              el.insertBefore(i, first)
            })
          })
        }
  
      , appendTo: function (target, host) {
          return insert.call(this, target, host, function (t, el) {
            t.appendChild(el)
          })
        }
  
      , prependTo: function (target, host) {
          return insert.call(this, target, host, function (t, el) {
            t.insertBefore(el, t.firstChild)
          })
        }
  
      , before: function (node) {
          return this.each(function (el) {
            each(bonzo.create(node), function (i) {
              el[parentNode].insertBefore(i, el)
            })
          })
        }
  
      , after: function (node) {
          return this.each(function (el) {
            each(bonzo.create(node), function (i) {
              el[parentNode].insertBefore(i, el.nextSibling)
            })
          })
        }
  
      , insertBefore: function (target, host) {
          return insert.call(this, target, host, function (t, el) {
            t[parentNode].insertBefore(el, t)
          })
        }
  
      , insertAfter: function (target, host) {
          return insert.call(this, target, host, function (t, el) {
            var sibling = t.nextSibling
            if (sibling) {
              t[parentNode].insertBefore(el, sibling);
            }
            else {
              t[parentNode].appendChild(el)
            }
          })
        }
  
      , replaceWith: function(html) {
          this.deepEach(clearData)
  
          return this.each(function (el) {
            el.parentNode.replaceChild(bonzo.create(html)[0], el)
          })
        }
  
        // class management
      , addClass: function (c) {
          c = toString.call(c).split(whitespaceRegex)
          return this.each(function (el) {
            // we `each` here so you can do $el.addClass('foo bar')
            each(c, function (c) {
              if (c && !hasClass(el, setter(el, c)))
                addClass(el, setter(el, c))
            })
          })
        }
  
      , removeClass: function (c) {
          c = toString.call(c).split(whitespaceRegex)
          return this.each(function (el) {
            each(c, function (c) {
              if (c && hasClass(el, setter(el, c)))
                removeClass(el, setter(el, c))
            })
          })
        }
  
      , hasClass: function (c) {
          c = toString.call(c).split(whitespaceRegex)
          return some(this, function (el) {
            return some(c, function (c) {
              return c && hasClass(el, c)
            })
          })
        }
  
      , toggleClass: function (c, condition) {
          c = toString.call(c).split(whitespaceRegex)
          return this.each(function (el) {
            each(c, function (c) {
              if (c) {
                typeof condition !== 'undefined' ?
                  condition ? addClass(el, c) : removeClass(el, c) :
                  hasClass(el, c) ? removeClass(el, c) : addClass(el, c)
              }
            })
          })
        }
  
        // display togglers
      , show: function (type) {
          return this.each(function (el) {
            el.style.display = type || ''
          })
        }
  
      , hide: function () {
          return this.each(function (el) {
            el.style.display = 'none'
          })
        }
  
      , toggle: function (callback, type) {
          this.each(function (el) {
            el.style.display = (el.offsetWidth || el.offsetHeight) ? 'none' : type || ''
          })
          callback && callback()
          return this
        }
  
        // DOM Walkers & getters
      , first: function () {
          return bonzo(this.length ? this[0] : [])
        }
  
      , last: function () {
          return bonzo(this.length ? this[this.length - 1] : [])
        }
  
      , next: function () {
          return this.related('nextSibling')
        }
  
      , previous: function () {
          return this.related('previousSibling')
        }
  
      , parent: function() {
          return this.related(parentNode)
        }
  
      , related: function (method) {
          return this.map(
            function (el) {
              el = el[method]
              while (el && el.nodeType !== 1) {
                el = el[method]
              }
              return el || 0
            },
            function (el) {
              return el
            }
          )
        }
  
        // meh. use with care. the ones in Bean are better
      , focus: function () {
          this.length && this[0].focus()
          return this
        }
  
      , blur: function () {
          return this.each(function (el) {
            el.blur()
          })
        }
  
        // style getter setter & related methods
      , css: function (o, v, p) {
          // is this a request for just getting a style?
          if (v === undefined && typeof o == 'string') {
            // repurpose 'v'
            v = this[0]
            if (!v) {
              return null
            }
            if (v === doc || v === win) {
              p = (v === doc) ? bonzo.doc() : bonzo.viewport()
              return o == 'width' ? p.width : o == 'height' ? p.height : ''
            }
            return (o = styleProperty(o)) ? getStyle(v, o) : null
          }
          var iter = o
          if (typeof o == 'string') {
            iter = {}
            iter[o] = v
          }
  
          if (ie && iter.opacity) {
            // oh this 'ol gamut
            iter.filter = 'alpha(opacity=' + (iter.opacity * 100) + ')'
            // give it layout
            iter.zoom = o.zoom || 1;
            delete iter.opacity;
          }
  
          function fn(el, p, v) {
            for (var k in iter) {
              if (iter.hasOwnProperty(k)) {
                v = iter[k];
                // change "5" to "5px" - unless you're line-height, which is allowed
                (p = styleProperty(k)) && digit.test(v) && !(p in unitless) && (v += px)
                el.style[p] = setter(el, v)
              }
            }
          }
          return this.each(fn)
        }
  
      , offset: function (x, y) {
          if (typeof x == 'number' || typeof y == 'number') {
            return this.each(function (el) {
              xy(el, x, y)
            })
          }
          if (!this[0]) return {
              top: 0
            , left: 0
            , height: 0
            , width: 0
          }
          var el = this[0]
            , width = el.offsetWidth
            , height = el.offsetHeight
            , top = el.offsetTop
            , left = el.offsetLeft
          while (el = el.offsetParent) {
            top = top + el.offsetTop
            left = left + el.offsetLeft
  
            if (el != document.body) {
              top -= el.scrollTop
              left -= el.scrollLeft
            }
          }
  
          return {
              top: top
            , left: left
            , height: height
            , width: width
          }
        }
  
      , dim: function () {
          if (!this.length) return { height: 0, width: 0 }
          var el = this[0]
            , orig = !el.offsetWidth && !el.offsetHeight ?
               // el isn't visible, can't be measured properly, so fix that
               function (t, s) {
                  s = {
                      position: el.style.position || ''
                    , visibility: el.style.visibility || ''
                    , display: el.style.display || ''
                  }
                  t.first().css({
                      position: 'absolute'
                    , visibility: 'hidden'
                    , display: 'block'
                  })
                  return s
                }(this) : null
            , width = el.offsetWidth
            , height = el.offsetHeight
  
          orig && this.first().css(orig)
          return {
              height: height
            , width: width
          }
        }
  
        // attributes are hard. go shopping
      , attr: function (k, v) {
          var el = this[0]
          if (typeof k != 'string' && !(k instanceof String)) {
            for (var n in k) {
              k.hasOwnProperty(n) && this.attr(n, k[n])
            }
            return this
          }
          return typeof v == 'undefined' ?
            !el ? null : specialAttributes.test(k) ?
              stateAttributes.test(k) && typeof el[k] == 'string' ?
                true : el[k] : (k == 'href' || k =='src') && features.hrefExtended ?
                  el[getAttribute](k, 2) : el[getAttribute](k) :
            this.each(function (el) {
              specialAttributes.test(k) ? (el[k] = setter(el, v)) : el[setAttribute](k, setter(el, v))
            })
        }
  
      , removeAttr: function (k) {
          return this.each(function (el) {
            stateAttributes.test(k) ? (el[k] = false) : el.removeAttribute(k)
          })
        }
  
      , val: function (s) {
          return (typeof s == 'string') ?
            this.attr('value', s) :
            this.length ? this[0].value : null
        }
  
        // use with care and knowledge. this data() method uses data attributes on the DOM nodes
        // to do this differently costs a lot more code. c'est la vie
      , data: function (k, v) {
          var el = this[0], uid, o, m
          if (typeof v === 'undefined') {
            if (!el) return null
            o = data(el)
            if (typeof k === 'undefined') {
              each(el.attributes, function(a) {
                (m = ('' + a.name).match(dattr)) && (o[camelize(m[1])] = dataValue(a.value))
              })
              return o
            } else {
              if (typeof o[k] === 'undefined')
                o[k] = dataValue(this.attr('data-' + decamelize(k)))
              return o[k]
            }
          } else {
            return this.each(function (el) { data(el)[k] = v })
          }
        }
  
        // DOM detachment & related
      , remove: function () {
          this.deepEach(clearData)
  
          return this.each(function (el) {
            el[parentNode] && el[parentNode].removeChild(el)
          })
        }
  
      , empty: function () {
          return this.each(function (el) {
            deepEach(el.childNodes, clearData)
  
            while (el.firstChild) {
              el.removeChild(el.firstChild)
            }
          })
        }
  
      , detach: function () {
          return this.map(function (el) {
            return el[parentNode].removeChild(el)
          })
        }
  
        // who uses a mouse anyway? oh right.
      , scrollTop: function (y) {
          return scroll.call(this, null, y, 'y')
        }
  
      , scrollLeft: function (x) {
          return scroll.call(this, x, null, 'x')
        }
  
    }
  
    function normalize(node) {
      return typeof node == 'string' ? bonzo.create(node) : isNode(node) ? [node] : node // assume [nodes]
    }
  
    function scroll(x, y, type) {
      var el = this[0]
      if (!el) return this
      if (x == null && y == null) {
        return (isBody(el) ? getWindowScroll() : { x: el.scrollLeft, y: el.scrollTop })[type]
      }
      if (isBody(el)) {
        win.scrollTo(x, y)
      } else {
        x != null && (el.scrollLeft = x)
        y != null && (el.scrollTop = y)
      }
      return this
    }
  
    function isBody(element) {
      return element === win || (/^(?:body|html)$/i).test(element.tagName)
    }
  
    function getWindowScroll() {
      return { x: win.pageXOffset || html.scrollLeft, y: win.pageYOffset || html.scrollTop }
    }
  
    function bonzo(els, host) {
      return new Bonzo(els, host)
    }
  
    bonzo.setQueryEngine = function (q) {
      query = q;
      delete bonzo.setQueryEngine
    }
  
    bonzo.aug = function (o, target) {
      // for those standalone bonzo users. this love is for you.
      for (var k in o) {
        o.hasOwnProperty(k) && ((target || Bonzo.prototype)[k] = o[k])
      }
    }
  
    bonzo.create = function (node) {
      // hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh
      return typeof node == 'string' && node !== '' ?
        function () {
          var tag = /^\s*<([^\s>]+)/.exec(node)
            , el = doc.createElement('div')
            , els = []
            , p = tag ? tagMap[tag[1].toLowerCase()] : null
            , dep = p ? p[2] + 1 : 1
            , ns = p && p[3]
            , pn = parentNode
            , tb = features.autoTbody && p && p[0] == '<table>' && !(/<tbody/i).test(node)
  
          el.innerHTML = p ? (p[0] + node + p[1]) : node
          while (dep--) el = el.firstChild
          // for IE NoScope, we may insert cruft at the begining just to get it to work
          if (ns && el && el.nodeType !== 1) el = el.nextSibling
          do {
            // tbody special case for IE<8, creates tbody on any empty table
            // we don't want it if we're just after a <thead>, <caption>, etc.
            if ((!tag || el.nodeType == 1) && (!tb || el.tagName.toLowerCase() != 'tbody')) {
              els.push(el)
            }
          } while (el = el.nextSibling)
          // IE < 9 gives us a parentNode which messes up insert() check for cloning
          // `dep` > 1 can also cause problems with the insert() check (must do this last)
          each(els, function(el) { el[pn] && el[pn].removeChild(el) })
          return els
  
        }() : isNode(node) ? [node.cloneNode(true)] : []
    }
  
    bonzo.doc = function () {
      var vp = bonzo.viewport()
      return {
          width: Math.max(doc.body.scrollWidth, html.scrollWidth, vp.width)
        , height: Math.max(doc.body.scrollHeight, html.scrollHeight, vp.height)
      }
    }
  
    bonzo.firstChild = function (el) {
      for (var c = el.childNodes, i = 0, j = (c && c.length) || 0, e; i < j; i++) {
        if (c[i].nodeType === 1) e = c[j = i]
      }
      return e
    }
  
    bonzo.viewport = function () {
      return {
          width: ie ? html.clientWidth : self.innerWidth
        , height: ie ? html.clientHeight : self.innerHeight
      }
    }
  
    bonzo.isAncestor = 'compareDocumentPosition' in html ?
      function (container, element) {
        return (container.compareDocumentPosition(element) & 16) == 16
      } : 'contains' in html ?
      function (container, element) {
        return container !== element && container.contains(element);
      } :
      function (container, element) {
        while (element = element[parentNode]) {
          if (element === container) {
            return true
          }
        }
        return false
      }
  
    return bonzo
  }, this); // the only line we care about using a semi-colon. placed here for concatenation tools
  

  provide("bonzo", module.exports);

  (function ($) {
  
    var b = require('bonzo')
    b.setQueryEngine($)
    $.ender(b)
    $.ender(b(), true)
    $.ender({
      create: function (node) {
        return $(b.create(node))
      }
    })
  
    $.id = function (id) {
      return $([document.getElementById(id)])
    }
  
    function indexOf(ar, val) {
      for (var i = 0; i < ar.length; i++) if (ar[i] === val) return i
      return -1
    }
  
    function uniq(ar) {
      var r = [], i = 0, j = 0, k, item, inIt
      for (; item = ar[i]; ++i) {
        inIt = false
        for (k = 0; k < r.length; ++k) {
          if (r[k] === item) {
            inIt = true; break
          }
        }
        if (!inIt) r[j++] = item
      }
      return r
    }
  
    $.ender({
      parents: function (selector, closest) {
        if (!this.length) return this
        var collection = $(selector), j, k, p, r = []
        for (j = 0, k = this.length; j < k; j++) {
          p = this[j]
          while (p = p.parentNode) {
            if (~indexOf(collection, p)) {
              r.push(p)
              if (closest) break;
            }
          }
        }
        return $(uniq(r))
      }
  
    , parent: function() {
        return $(uniq(b(this).parent()))
      }
  
    , closest: function (selector) {
        return this.parents(selector, true)
      }
  
    , first: function () {
        return $(this.length ? this[0] : this)
      }
  
    , last: function () {
        return $(this.length ? this[this.length - 1] : [])
      }
  
    , next: function () {
        return $(b(this).next())
      }
  
    , previous: function () {
        return $(b(this).previous())
      }
  
    , appendTo: function (t) {
        return b(this.selector).appendTo(t, this)
      }
  
    , prependTo: function (t) {
        return b(this.selector).prependTo(t, this)
      }
  
    , insertAfter: function (t) {
        return b(this.selector).insertAfter(t, this)
      }
  
    , insertBefore: function (t) {
        return b(this.selector).insertBefore(t, this)
      }
  
    , siblings: function () {
        var i, l, p, r = []
        for (i = 0, l = this.length; i < l; i++) {
          p = this[i]
          while (p = p.previousSibling) p.nodeType == 1 && r.push(p)
          p = this[i]
          while (p = p.nextSibling) p.nodeType == 1 && r.push(p)
        }
        return $(r)
      }
  
    , children: function () {
        var i, l, el, r = []
        for (i = 0, l = this.length; i < l; i++) {
          if (!(el = b.firstChild(this[i]))) continue;
          r.push(el)
          while (el = el.nextSibling) el.nodeType == 1 && r.push(el)
        }
        return $(uniq(r))
      }
  
    , height: function (v) {
        return dimension.call(this, 'height', v)
      }
  
    , width: function (v) {
        return dimension.call(this, 'width', v)
      }
    }, true)
  
    function dimension(type, v) {
      return typeof v == 'undefined'
        ? b(this).dim()[type]
        : this.css(type, v)
    }
  }(ender));

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /*!
    * domready (c) Dustin Diaz 2012 - License MIT
    */
  !function (name, definition) {
    if (typeof module != 'undefined') module.exports = definition()
    else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
    else this[name] = definition()
  }('domready', function (ready) {
  
    var fns = [], fn, f = false
      , doc = document
      , testEl = doc.documentElement
      , hack = testEl.doScroll
      , domContentLoaded = 'DOMContentLoaded'
      , addEventListener = 'addEventListener'
      , onreadystatechange = 'onreadystatechange'
      , readyState = 'readyState'
      , loaded = /^loade|c/.test(doc[readyState])
  
    function flush(f) {
      loaded = 1
      while (f = fns.shift()) f()
    }
  
    doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function () {
      doc.removeEventListener(domContentLoaded, fn, f)
      flush()
    }, f)
  
  
    hack && doc.attachEvent(onreadystatechange, fn = function () {
      if (/^c/.test(doc[readyState])) {
        doc.detachEvent(onreadystatechange, fn)
        flush()
      }
    })
  
    return (ready = hack ?
      function (fn) {
        self != top ?
          loaded ? fn() : fns.push(fn) :
          function () {
            try {
              testEl.doScroll('left')
            } catch (e) {
              return setTimeout(function() { ready(fn) }, 50)
            }
            fn()
          }()
      } :
      function (fn) {
        loaded ? fn() : fns.push(fn)
      })
  })

  provide("domready", module.exports);

  !function ($) {
    var ready = require('domready')
    $.ender({domReady: ready})
    $.ender({
      ready: function (f) {
        ready(f)
        return this
      }
    }, true)
  }(ender);

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /*!
    * Qwery - A Blazing Fast query selector engine
    * https://github.com/ded/qwery
    * copyright Dustin Diaz & Jacob Thornton 2011
    * MIT License
    */
  
  (function (name, definition, context) {
    if (typeof module != 'undefined' && module.exports) module.exports = definition()
    else if (typeof context['define'] != 'undefined' && context['define'] == 'function' && context['define']['amd']) define(name, definition)
    else context[name] = definition()
  })('qwery', function () {
    var doc = document
      , html = doc.documentElement
      , byClass = 'getElementsByClassName'
      , byTag = 'getElementsByTagName'
      , qSA = 'querySelectorAll'
      , useNativeQSA = 'useNativeQSA'
      , tagName = 'tagName'
      , nodeType = 'nodeType'
      , select // main select() method, assign later
  
      // OOOOOOOOOOOOH HERE COME THE ESSSXXSSPRESSSIONSSSSSSSS!!!!!
      , id = /#([\w\-]+)/
      , clas = /\.[\w\-]+/g
      , idOnly = /^#([\w\-]+)$/
      , classOnly = /^\.([\w\-]+)$/
      , tagOnly = /^([\w\-]+)$/
      , tagAndOrClass = /^([\w]+)?\.([\w\-]+)$/
      , splittable = /(^|,)\s*[>~+]/
      , normalizr = /^\s+|\s*([,\s\+\~>]|$)\s*/g
      , splitters = /[\s\>\+\~]/
      , splittersMore = /(?![\s\w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^'"]*\]|[\s\w\+\-]*\))/
      , specialChars = /([.*+?\^=!:${}()|\[\]\/\\])/g
      , simple = /^(\*|[a-z0-9]+)?(?:([\.\#]+[\w\-\.#]+)?)/
      , attr = /\[([\w\-]+)(?:([\|\^\$\*\~]?\=)['"]?([ \w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^]+)["']?)?\]/
      , pseudo = /:([\w\-]+)(\(['"]?([^()]+)['"]?\))?/
      , easy = new RegExp(idOnly.source + '|' + tagOnly.source + '|' + classOnly.source)
      , dividers = new RegExp('(' + splitters.source + ')' + splittersMore.source, 'g')
      , tokenizr = new RegExp(splitters.source + splittersMore.source)
      , chunker = new RegExp(simple.source + '(' + attr.source + ')?' + '(' + pseudo.source + ')?')
      , walker = {
          ' ': function (node) {
            return node && node !== html && node.parentNode
          }
        , '>': function (node, contestant) {
            return node && node.parentNode == contestant.parentNode && node.parentNode
          }
        , '~': function (node) {
            return node && node.previousSibling
          }
        , '+': function (node, contestant, p1, p2) {
            if (!node) return false
            return (p1 = previous(node)) && (p2 = previous(contestant)) && p1 == p2 && p1
          }
        }
  
    function cache() {
      this.c = {}
    }
    cache.prototype = {
      g: function (k) {
        return this.c[k] || undefined
      }
    , s: function (k, v, r) {
        v = r ? new RegExp(v) : v
        return (this.c[k] = v)
      }
    }
  
    var classCache = new cache()
      , cleanCache = new cache()
      , attrCache = new cache()
      , tokenCache = new cache()
  
    function classRegex(c) {
      return classCache.g(c) || classCache.s(c, '(^|\\s+)' + c + '(\\s+|$)', 1)
    }
  
    // not quite as fast as inline loops in older browsers so don't use liberally
    function each(a, fn) {
      var i = 0, l = a.length
      for (; i < l; i++) fn(a[i])
    }
  
    function flatten(ar) {
      for (var r = [], i = 0, l = ar.length; i < l; ++i) arrayLike(ar[i]) ? (r = r.concat(ar[i])) : (r[r.length] = ar[i])
      return r
    }
  
    function arrayify(ar) {
      var i = 0, l = ar.length, r = []
      for (; i < l; i++) r[i] = ar[i]
      return r
    }
  
    function previous(n) {
      while (n = n.previousSibling) if (n[nodeType] == 1) break;
      return n
    }
  
    function q(query) {
      return query.match(chunker)
    }
  
    // called using `this` as element and arguments from regex group results.
    // given => div.hello[title="world"]:foo('bar')
    // div.hello[title="world"]:foo('bar'), div, .hello, [title="world"], title, =, world, :foo('bar'), foo, ('bar'), bar]
    function interpret(whole, tag, idsAndClasses, wholeAttribute, attribute, qualifier, value, wholePseudo, pseudo, wholePseudoVal, pseudoVal) {
      var i, m, k, o, classes
      if (this[nodeType] !== 1) return false
      if (tag && tag !== '*' && this[tagName] && this[tagName].toLowerCase() !== tag) return false
      if (idsAndClasses && (m = idsAndClasses.match(id)) && m[1] !== this.id) return false
      if (idsAndClasses && (classes = idsAndClasses.match(clas))) {
        for (i = classes.length; i--;) if (!classRegex(classes[i].slice(1)).test(this.className)) return false
      }
      if (pseudo && qwery.pseudos[pseudo] && !qwery.pseudos[pseudo](this, pseudoVal)) return false
      if (wholeAttribute && !value) { // select is just for existance of attrib
        o = this.attributes
        for (k in o) {
          if (Object.prototype.hasOwnProperty.call(o, k) && (o[k].name || k) == attribute) {
            return this
          }
        }
      }
      if (wholeAttribute && !checkAttr(qualifier, getAttr(this, attribute) || '', value)) {
        // select is for attrib equality
        return false
      }
      return this
    }
  
    function clean(s) {
      return cleanCache.g(s) || cleanCache.s(s, s.replace(specialChars, '\\$1'))
    }
  
    function checkAttr(qualify, actual, val) {
      switch (qualify) {
      case '=':
        return actual == val
      case '^=':
        return actual.match(attrCache.g('^=' + val) || attrCache.s('^=' + val, '^' + clean(val), 1))
      case '$=':
        return actual.match(attrCache.g('$=' + val) || attrCache.s('$=' + val, clean(val) + '$', 1))
      case '*=':
        return actual.match(attrCache.g(val) || attrCache.s(val, clean(val), 1))
      case '~=':
        return actual.match(attrCache.g('~=' + val) || attrCache.s('~=' + val, '(?:^|\\s+)' + clean(val) + '(?:\\s+|$)', 1))
      case '|=':
        return actual.match(attrCache.g('|=' + val) || attrCache.s('|=' + val, '^' + clean(val) + '(-|$)', 1))
      }
      return 0
    }
  
    // given a selector, first check for simple cases then collect all base candidate matches and filter
    function _qwery(selector, _root) {
      var r = [], ret = [], i, l, m, token, tag, els, intr, item, root = _root
        , tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr))
        , dividedTokens = selector.match(dividers)
  
      if (!tokens.length) return r
  
      token = (tokens = tokens.slice(0)).pop() // copy cached tokens, take the last one
      if (tokens.length && (m = tokens[tokens.length - 1].match(idOnly))) root = byId(_root, m[1])
      if (!root) return r
  
      intr = q(token)
      // collect base candidates to filter
      els = root !== _root && root[nodeType] !== 9 && dividedTokens && /^[+~]$/.test(dividedTokens[dividedTokens.length - 1]) ?
        function (r) {
          while (root = root.nextSibling) {
            root[nodeType] == 1 && (intr[1] ? intr[1] == root[tagName].toLowerCase() : 1) && (r[r.length] = root)
          }
          return r
        }([]) :
        root[byTag](intr[1] || '*')
      // filter elements according to the right-most part of the selector
      for (i = 0, l = els.length; i < l; i++) {
        if (item = interpret.apply(els[i], intr)) r[r.length] = item
      }
      if (!tokens.length) return r
  
      // filter further according to the rest of the selector (the left side)
      each(r, function(e) { if (ancestorMatch(e, tokens, dividedTokens)) ret[ret.length] = e })
      return ret
    }
  
    // compare element to a selector
    function is(el, selector, root) {
      if (isNode(selector)) return el == selector
      if (arrayLike(selector)) return !!~flatten(selector).indexOf(el) // if selector is an array, is el a member?
  
      var selectors = selector.split(','), tokens, dividedTokens
      while (selector = selectors.pop()) {
        tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr))
        dividedTokens = selector.match(dividers)
        tokens = tokens.slice(0) // copy array
        if (interpret.apply(el, q(tokens.pop())) && (!tokens.length || ancestorMatch(el, tokens, dividedTokens, root))) {
          return true
        }
      }
      return false
    }
  
    // given elements matching the right-most part of a selector, filter out any that don't match the rest
    function ancestorMatch(el, tokens, dividedTokens, root) {
      var cand
      // recursively work backwards through the tokens and up the dom, covering all options
      function crawl(e, i, p) {
        while (p = walker[dividedTokens[i]](p, e)) {
          if (isNode(p) && (interpret.apply(p, q(tokens[i])))) {
            if (i) {
              if (cand = crawl(p, i - 1, p)) return cand
            } else return p
          }
        }
      }
      return (cand = crawl(el, tokens.length - 1, el)) && (!root || isAncestor(cand, root))
    }
  
    function isNode(el, t) {
      return el && typeof el === 'object' && (t = el[nodeType]) && (t == 1 || t == 9)
    }
  
    function uniq(ar) {
      var a = [], i, j
      o: for (i = 0; i < ar.length; ++i) {
        for (j = 0; j < a.length; ++j) if (a[j] == ar[i]) continue o
        a[a.length] = ar[i]
      }
      return a
    }
  
    function arrayLike(o) {
      return (typeof o === 'object' && isFinite(o.length))
    }
  
    function normalizeRoot(root) {
      if (!root) return doc
      if (typeof root == 'string') return qwery(root)[0]
      if (!root[nodeType] && arrayLike(root)) return root[0]
      return root
    }
  
    function byId(root, id, el) {
      // if doc, query on it, else query the parent doc or if a detached fragment rewrite the query and run on the fragment
      return root[nodeType] === 9 ? root.getElementById(id) :
        root.ownerDocument &&
          (((el = root.ownerDocument.getElementById(id)) && isAncestor(el, root) && el) ||
            (!isAncestor(root, root.ownerDocument) && select('[id="' + id + '"]', root)[0]))
    }
  
    function qwery(selector, _root) {
      var m, el, root = normalizeRoot(_root)
  
      // easy, fast cases that we can dispatch with simple DOM calls
      if (!root || !selector) return []
      if (selector === window || isNode(selector)) {
        return !_root || (selector !== window && isNode(root) && isAncestor(selector, root)) ? [selector] : []
      }
      if (selector && arrayLike(selector)) return flatten(selector)
      if (m = selector.match(easy)) {
        if (m[1]) return (el = byId(root, m[1])) ? [el] : []
        if (m[2]) return arrayify(root[byTag](m[2]))
        if (hasByClass && m[3]) return arrayify(root[byClass](m[3]))
      }
  
      return select(selector, root)
    }
  
    // where the root is not document and a relationship selector is first we have to
    // do some awkward adjustments to get it to work, even with qSA
    function collectSelector(root, collector) {
      return function(s) {
        var oid, nid
        if (splittable.test(s)) {
          if (root[nodeType] !== 9) {
           // make sure the el has an id, rewrite the query, set root to doc and run it
           if (!(nid = oid = root.getAttribute('id'))) root.setAttribute('id', nid = '__qwerymeupscotty')
           s = '[id="' + nid + '"]' + s // avoid byId and allow us to match context element
           collector(root.parentNode || root, s, true)
           oid || root.removeAttribute('id')
          }
          return;
        }
        s.length && collector(root, s, false)
      }
    }
  
    var isAncestor = 'compareDocumentPosition' in html ?
      function (element, container) {
        return (container.compareDocumentPosition(element) & 16) == 16
      } : 'contains' in html ?
      function (element, container) {
        container = container[nodeType] === 9 || container == window ? html : container
        return container !== element && container.contains(element)
      } :
      function (element, container) {
        while (element = element.parentNode) if (element === container) return 1
        return 0
      }
    , getAttr = function() {
        // detect buggy IE src/href getAttribute() call
        var e = doc.createElement('p')
        return ((e.innerHTML = '<a href="#x">x</a>') && e.firstChild.getAttribute('href') != '#x') ?
          function(e, a) {
            return a === 'class' ? e.className : (a === 'href' || a === 'src') ?
              e.getAttribute(a, 2) : e.getAttribute(a)
          } :
          function(e, a) { return e.getAttribute(a) }
     }()
    , hasByClass = !!doc[byClass]
      // has native qSA support
    , hasQSA = doc.querySelector && doc[qSA]
      // use native qSA
    , selectQSA = function (selector, root) {
        var result = [], ss, e
        try {
          if (root[nodeType] === 9 || !splittable.test(selector)) {
            // most work is done right here, defer to qSA
            return arrayify(root[qSA](selector))
          }
          // special case where we need the services of `collectSelector()`
          each(ss = selector.split(','), collectSelector(root, function(ctx, s) {
            e = ctx[qSA](s)
            if (e.length == 1) result[result.length] = e.item(0)
            else if (e.length) result = result.concat(arrayify(e))
          }))
          return ss.length > 1 && result.length > 1 ? uniq(result) : result
        } catch(ex) { }
        return selectNonNative(selector, root)
      }
      // no native selector support
    , selectNonNative = function (selector, root) {
        var result = [], items, m, i, l, r, ss
        selector = selector.replace(normalizr, '$1')
        if (m = selector.match(tagAndOrClass)) {
          r = classRegex(m[2])
          items = root[byTag](m[1] || '*')
          for (i = 0, l = items.length; i < l; i++) {
            if (r.test(items[i].className)) result[result.length] = items[i]
          }
          return result
        }
        // more complex selector, get `_qwery()` to do the work for us
        each(ss = selector.split(','), collectSelector(root, function(ctx, s, rewrite) {
          r = _qwery(s, ctx)
          for (i = 0, l = r.length; i < l; i++) {
            if (ctx[nodeType] === 9 || rewrite || isAncestor(r[i], root)) result[result.length] = r[i]
          }
        }))
        return ss.length > 1 && result.length > 1 ? uniq(result) : result
      }
    , configure = function (options) {
        // configNativeQSA: use fully-internal selector or native qSA where present
        if (typeof options[useNativeQSA] !== 'undefined')
          select = !options[useNativeQSA] ? selectNonNative : hasQSA ? selectQSA : selectNonNative
      }
  
    configure({ useNativeQSA: true })
  
    qwery.configure = configure
    qwery.uniq = uniq
    qwery.is = is
    qwery.pseudos = {}
  
    return qwery
  }, this);
  

  provide("qwery", module.exports);

  (function ($) {
    var q = require('qwery')
  
    $.pseudos = q.pseudos
  
    $._select = function (s, r) {
      // detect if sibling module 'bonzo' is available at run-time
      // rather than load-time since technically it's not a dependency and
      // can be loaded in any order
      // hence the lazy function re-definition
      return ($._select = (function (b) {
        try {
          b = require('bonzo')
          return function (s, r) {
            return /^\s*</.test(s) ? b.create(s, r) : q(s, r)
          }
        } catch (e) { }
        return q
      })())(s, r)
    }
  
    $.ender({
        find: function (s) {
          var r = [], i, l, j, k, els
          for (i = 0, l = this.length; i < l; i++) {
            els = q(s, this[i])
            for (j = 0, k = els.length; j < k; j++) r.push(els[j])
          }
          return $(q.uniq(r))
        }
      , and: function (s) {
          var plus = $(s)
          for (var i = this.length, j = 0, l = this.length + plus.length; i < l; i++, j++) {
            this[i] = plus[j]
          }
          return this
        }
      , is: function(s, r) {
          var i, l
          for (i = 0, l = this.length; i < l; i++) {
            if (q.is(this[i], s, r)) {
              return true
            }
          }
          return false
        }
    }, true)
  }(ender));
  

}());



(function () {

  var module = { exports: {} }, exports = module.exports;

  /*!
   * Sizzle CSS Selector Engine
   *  Copyright 2011, The Dojo Foundation
   *  Released under the MIT, BSD, and GPL Licenses.
   *  More information: http://sizzlejs.com/
   */
  (function(){
  
  var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
  	expando = "sizcache" + (Math.random() + '').replace('.', ''),
  	done = 0,
  	toString = Object.prototype.toString,
  	hasDuplicate = false,
  	baseHasDuplicate = true,
  	rBackslash = /\\/g,
  	rReturn = /\r\n/g,
  	rNonWord = /\W/;
  
  // Here we check if the JavaScript engine is using some sort of
  // optimization where it does not always call our comparision
  // function. If that is the case, discard the hasDuplicate value.
  //   Thus far that includes Google Chrome.
  [0, 0].sort(function() {
  	baseHasDuplicate = false;
  	return 0;
  });
  
  var Sizzle = function( selector, context, results, seed ) {
  	results = results || [];
  	context = context || document;
  
  	var origContext = context;
  
  	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
  		return [];
  	}
  
  	if ( !selector || typeof selector !== "string" ) {
  		return results;
  	}
  
  	var m, set, checkSet, extra, ret, cur, pop, i,
  		prune = true,
  		contextXML = Sizzle.isXML( context ),
  		parts = [],
  		soFar = selector;
  
  	// Reset the position of the chunker regexp (start from head)
  	do {
  		chunker.exec( "" );
  		m = chunker.exec( soFar );
  
  		if ( m ) {
  			soFar = m[3];
  
  			parts.push( m[1] );
  
  			if ( m[2] ) {
  				extra = m[3];
  				break;
  			}
  		}
  	} while ( m );
  
  	if ( parts.length > 1 && origPOS.exec( selector ) ) {
  
  		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
  			set = posProcess( parts[0] + parts[1], context, seed );
  
  		} else {
  			set = Expr.relative[ parts[0] ] ?
  				[ context ] :
  				Sizzle( parts.shift(), context );
  
  			while ( parts.length ) {
  				selector = parts.shift();
  
  				if ( Expr.relative[ selector ] ) {
  					selector += parts.shift();
  				}
  
  				set = posProcess( selector, set, seed );
  			}
  		}
  
  	} else {
  		// Take a shortcut and set the context if the root selector is an ID
  		// (but not if it'll be faster if the inner selector is an ID)
  		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
  				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {
  
  			ret = Sizzle.find( parts.shift(), context, contextXML );
  			context = ret.expr ?
  				Sizzle.filter( ret.expr, ret.set )[0] :
  				ret.set[0];
  		}
  
  		if ( context ) {
  			ret = seed ?
  				{ expr: parts.pop(), set: makeArray(seed) } :
  				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );
  
  			set = ret.expr ?
  				Sizzle.filter( ret.expr, ret.set ) :
  				ret.set;
  
  			if ( parts.length > 0 ) {
  				checkSet = makeArray( set );
  
  			} else {
  				prune = false;
  			}
  
  			while ( parts.length ) {
  				cur = parts.pop();
  				pop = cur;
  
  				if ( !Expr.relative[ cur ] ) {
  					cur = "";
  				} else {
  					pop = parts.pop();
  				}
  
  				if ( pop == null ) {
  					pop = context;
  				}
  
  				Expr.relative[ cur ]( checkSet, pop, contextXML );
  			}
  
  		} else {
  			checkSet = parts = [];
  		}
  	}
  
  	if ( !checkSet ) {
  		checkSet = set;
  	}
  
  	if ( !checkSet ) {
  		Sizzle.error( cur || selector );
  	}
  
  	if ( toString.call(checkSet) === "[object Array]" ) {
  		if ( !prune ) {
  			results.push.apply( results, checkSet );
  
  		} else if ( context && context.nodeType === 1 ) {
  			for ( i = 0; checkSet[i] != null; i++ ) {
  				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
  					results.push( set[i] );
  				}
  			}
  
  		} else {
  			for ( i = 0; checkSet[i] != null; i++ ) {
  				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
  					results.push( set[i] );
  				}
  			}
  		}
  
  	} else {
  		makeArray( checkSet, results );
  	}
  
  	if ( extra ) {
  		Sizzle( extra, origContext, results, seed );
  		Sizzle.uniqueSort( results );
  	}
  
  	return results;
  };
  
  Sizzle.uniqueSort = function( results ) {
  	if ( sortOrder ) {
  		hasDuplicate = baseHasDuplicate;
  		results.sort( sortOrder );
  
  		if ( hasDuplicate ) {
  			for ( var i = 1; i < results.length; i++ ) {
  				if ( results[i] === results[ i - 1 ] ) {
  					results.splice( i--, 1 );
  				}
  			}
  		}
  	}
  
  	return results;
  };
  
  Sizzle.matches = function( expr, set ) {
  	return Sizzle( expr, null, null, set );
  };
  
  Sizzle.matchesSelector = function( node, expr ) {
  	return Sizzle( expr, null, null, [node] ).length > 0;
  };
  
  Sizzle.find = function( expr, context, isXML ) {
  	var set, i, len, match, type, left;
  
  	if ( !expr ) {
  		return [];
  	}
  
  	for ( i = 0, len = Expr.order.length; i < len; i++ ) {
  		type = Expr.order[i];
  
  		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
  			left = match[1];
  			match.splice( 1, 1 );
  
  			if ( left.substr( left.length - 1 ) !== "\\" ) {
  				match[1] = (match[1] || "").replace( rBackslash, "" );
  				set = Expr.find[ type ]( match, context, isXML );
  
  				if ( set != null ) {
  					expr = expr.replace( Expr.match[ type ], "" );
  					break;
  				}
  			}
  		}
  	}
  
  	if ( !set ) {
  		set = typeof context.getElementsByTagName !== "undefined" ?
  			context.getElementsByTagName( "*" ) :
  			[];
  	}
  
  	return { set: set, expr: expr };
  };
  
  Sizzle.filter = function( expr, set, inplace, not ) {
  	var match, anyFound,
  		type, found, item, filter, left,
  		i, pass,
  		old = expr,
  		result = [],
  		curLoop = set,
  		isXMLFilter = set && set[0] && Sizzle.isXML( set[0] );
  
  	while ( expr && set.length ) {
  		for ( type in Expr.filter ) {
  			if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
  				filter = Expr.filter[ type ];
  				left = match[1];
  
  				anyFound = false;
  
  				match.splice(1,1);
  
  				if ( left.substr( left.length - 1 ) === "\\" ) {
  					continue;
  				}
  
  				if ( curLoop === result ) {
  					result = [];
  				}
  
  				if ( Expr.preFilter[ type ] ) {
  					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );
  
  					if ( !match ) {
  						anyFound = found = true;
  
  					} else if ( match === true ) {
  						continue;
  					}
  				}
  
  				if ( match ) {
  					for ( i = 0; (item = curLoop[i]) != null; i++ ) {
  						if ( item ) {
  							found = filter( item, match, i, curLoop );
  							pass = not ^ found;
  
  							if ( inplace && found != null ) {
  								if ( pass ) {
  									anyFound = true;
  
  								} else {
  									curLoop[i] = false;
  								}
  
  							} else if ( pass ) {
  								result.push( item );
  								anyFound = true;
  							}
  						}
  					}
  				}
  
  				if ( found !== undefined ) {
  					if ( !inplace ) {
  						curLoop = result;
  					}
  
  					expr = expr.replace( Expr.match[ type ], "" );
  
  					if ( !anyFound ) {
  						return [];
  					}
  
  					break;
  				}
  			}
  		}
  
  		// Improper expression
  		if ( expr === old ) {
  			if ( anyFound == null ) {
  				Sizzle.error( expr );
  
  			} else {
  				break;
  			}
  		}
  
  		old = expr;
  	}
  
  	return curLoop;
  };
  
  Sizzle.error = function( msg ) {
  	throw new Error( "Syntax error, unrecognized expression: " + msg );
  };
  
  /**
   * Utility function for retreiving the text value of an array of DOM nodes
   * @param {Array|Element} elem
   */
  var getText = Sizzle.getText = function( elem ) {
      var i, node,
  		nodeType = elem.nodeType,
  		ret = "";
  
  	if ( nodeType ) {
  		if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
  			// Use textContent || innerText for elements
  			if ( typeof elem.textContent === 'string' ) {
  				return elem.textContent;
  			} else if ( typeof elem.innerText === 'string' ) {
  				// Replace IE's carriage returns
  				return elem.innerText.replace( rReturn, '' );
  			} else {
  				// Traverse it's children
  				for ( elem = elem.firstChild; elem; elem = elem.nextSibling) {
  					ret += getText( elem );
  				}
  			}
  		} else if ( nodeType === 3 || nodeType === 4 ) {
  			return elem.nodeValue;
  		}
  	} else {
  
  		// If no nodeType, this is expected to be an array
  		for ( i = 0; (node = elem[i]); i++ ) {
  			// Do not traverse comment nodes
  			if ( node.nodeType !== 8 ) {
  				ret += getText( node );
  			}
  		}
  	}
  	return ret;
  };
  
  var Expr = Sizzle.selectors = {
  	order: [ "ID", "NAME", "TAG" ],
  
  	match: {
  		ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
  		CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
  		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
  		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
  		TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
  		CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
  		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
  		PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
  	},
  
  	leftMatch: {},
  
  	attrMap: {
  		"class": "className",
  		"for": "htmlFor"
  	},
  
  	attrHandle: {
  		href: function( elem ) {
  			return elem.getAttribute( "href" );
  		},
  		type: function( elem ) {
  			return elem.getAttribute( "type" );
  		}
  	},
  
  	relative: {
  		"+": function(checkSet, part){
  			var isPartStr = typeof part === "string",
  				isTag = isPartStr && !rNonWord.test( part ),
  				isPartStrNotTag = isPartStr && !isTag;
  
  			if ( isTag ) {
  				part = part.toLowerCase();
  			}
  
  			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
  				if ( (elem = checkSet[i]) ) {
  					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}
  
  					checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
  						elem || false :
  						elem === part;
  				}
  			}
  
  			if ( isPartStrNotTag ) {
  				Sizzle.filter( part, checkSet, true );
  			}
  		},
  
  		">": function( checkSet, part ) {
  			var elem,
  				isPartStr = typeof part === "string",
  				i = 0,
  				l = checkSet.length;
  
  			if ( isPartStr && !rNonWord.test( part ) ) {
  				part = part.toLowerCase();
  
  				for ( ; i < l; i++ ) {
  					elem = checkSet[i];
  
  					if ( elem ) {
  						var parent = elem.parentNode;
  						checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
  					}
  				}
  
  			} else {
  				for ( ; i < l; i++ ) {
  					elem = checkSet[i];
  
  					if ( elem ) {
  						checkSet[i] = isPartStr ?
  							elem.parentNode :
  							elem.parentNode === part;
  					}
  				}
  
  				if ( isPartStr ) {
  					Sizzle.filter( part, checkSet, true );
  				}
  			}
  		},
  
  		"": function(checkSet, part, isXML){
  			var nodeCheck,
  				doneName = done++,
  				checkFn = dirCheck;
  
  			if ( typeof part === "string" && !rNonWord.test( part ) ) {
  				part = part.toLowerCase();
  				nodeCheck = part;
  				checkFn = dirNodeCheck;
  			}
  
  			checkFn( "parentNode", part, doneName, checkSet, nodeCheck, isXML );
  		},
  
  		"~": function( checkSet, part, isXML ) {
  			var nodeCheck,
  				doneName = done++,
  				checkFn = dirCheck;
  
  			if ( typeof part === "string" && !rNonWord.test( part ) ) {
  				part = part.toLowerCase();
  				nodeCheck = part;
  				checkFn = dirNodeCheck;
  			}
  
  			checkFn( "previousSibling", part, doneName, checkSet, nodeCheck, isXML );
  		}
  	},
  
  	find: {
  		ID: function( match, context, isXML ) {
  			if ( typeof context.getElementById !== "undefined" && !isXML ) {
  				var m = context.getElementById(match[1]);
  				// Check parentNode to catch when Blackberry 4.6 returns
  				// nodes that are no longer in the document #6963
  				return m && m.parentNode ? [m] : [];
  			}
  		},
  
  		NAME: function( match, context ) {
  			if ( typeof context.getElementsByName !== "undefined" ) {
  				var ret = [],
  					results = context.getElementsByName( match[1] );
  
  				for ( var i = 0, l = results.length; i < l; i++ ) {
  					if ( results[i].getAttribute("name") === match[1] ) {
  						ret.push( results[i] );
  					}
  				}
  
  				return ret.length === 0 ? null : ret;
  			}
  		},
  
  		TAG: function( match, context ) {
  			if ( typeof context.getElementsByTagName !== "undefined" ) {
  				return context.getElementsByTagName( match[1] );
  			}
  		}
  	},
  	preFilter: {
  		CLASS: function( match, curLoop, inplace, result, not, isXML ) {
  			match = " " + match[1].replace( rBackslash, "" ) + " ";
  
  			if ( isXML ) {
  				return match;
  			}
  
  			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
  				if ( elem ) {
  					if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0) ) {
  						if ( !inplace ) {
  							result.push( elem );
  						}
  
  					} else if ( inplace ) {
  						curLoop[i] = false;
  					}
  				}
  			}
  
  			return false;
  		},
  
  		ID: function( match ) {
  			return match[1].replace( rBackslash, "" );
  		},
  
  		TAG: function( match, curLoop ) {
  			return match[1].replace( rBackslash, "" ).toLowerCase();
  		},
  
  		CHILD: function( match ) {
  			if ( match[1] === "nth" ) {
  				if ( !match[2] ) {
  					Sizzle.error( match[0] );
  				}
  
  				match[2] = match[2].replace(/^\+|\s*/g, '');
  
  				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
  				var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
  					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
  					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);
  
  				// calculate the numbers (first)n+(last) including if they are negative
  				match[2] = (test[1] + (test[2] || 1)) - 0;
  				match[3] = test[3] - 0;
  			}
  			else if ( match[2] ) {
  				Sizzle.error( match[0] );
  			}
  
  			// TODO: Move to normal caching system
  			match[0] = done++;
  
  			return match;
  		},
  
  		ATTR: function( match, curLoop, inplace, result, not, isXML ) {
  			var name = match[1] = match[1].replace( rBackslash, "" );
  
  			if ( !isXML && Expr.attrMap[name] ) {
  				match[1] = Expr.attrMap[name];
  			}
  
  			// Handle if an un-quoted value was used
  			match[4] = ( match[4] || match[5] || "" ).replace( rBackslash, "" );
  
  			if ( match[2] === "~=" ) {
  				match[4] = " " + match[4] + " ";
  			}
  
  			return match;
  		},
  
  		PSEUDO: function( match, curLoop, inplace, result, not ) {
  			if ( match[1] === "not" ) {
  				// If we're dealing with a complex expression, or a simple one
  				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
  					match[3] = Sizzle(match[3], null, null, curLoop);
  
  				} else {
  					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
  
  					if ( !inplace ) {
  						result.push.apply( result, ret );
  					}
  
  					return false;
  				}
  
  			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
  				return true;
  			}
  
  			return match;
  		},
  
  		POS: function( match ) {
  			match.unshift( true );
  
  			return match;
  		}
  	},
  
  	filters: {
  		enabled: function( elem ) {
  			return elem.disabled === false && elem.type !== "hidden";
  		},
  
  		disabled: function( elem ) {
  			return elem.disabled === true;
  		},
  
  		checked: function( elem ) {
  			return elem.checked === true;
  		},
  
  		selected: function( elem ) {
  			// Accessing this property makes selected-by-default
  			// options in Safari work properly
  			if ( elem.parentNode ) {
  				elem.parentNode.selectedIndex;
  			}
  
  			return elem.selected === true;
  		},
  
  		parent: function( elem ) {
  			return !!elem.firstChild;
  		},
  
  		empty: function( elem ) {
  			return !elem.firstChild;
  		},
  
  		has: function( elem, i, match ) {
  			return !!Sizzle( match[3], elem ).length;
  		},
  
  		header: function( elem ) {
  			return (/h\d/i).test( elem.nodeName );
  		},
  
  		text: function( elem ) {
  			var attr = elem.getAttribute( "type" ), type = elem.type;
  			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
  			// use getAttribute instead to test this case
  			return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === type || attr === null );
  		},
  
  		radio: function( elem ) {
  			return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
  		},
  
  		checkbox: function( elem ) {
  			return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
  		},
  
  		file: function( elem ) {
  			return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
  		},
  
  		password: function( elem ) {
  			return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
  		},
  
  		submit: function( elem ) {
  			var name = elem.nodeName.toLowerCase();
  			return (name === "input" || name === "button") && "submit" === elem.type;
  		},
  
  		image: function( elem ) {
  			return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
  		},
  
  		reset: function( elem ) {
  			var name = elem.nodeName.toLowerCase();
  			return (name === "input" || name === "button") && "reset" === elem.type;
  		},
  
  		button: function( elem ) {
  			var name = elem.nodeName.toLowerCase();
  			return name === "input" && "button" === elem.type || name === "button";
  		},
  
  		input: function( elem ) {
  			return (/input|select|textarea|button/i).test( elem.nodeName );
  		},
  
  		focus: function( elem ) {
  			return elem === elem.ownerDocument.activeElement;
  		}
  	},
  	setFilters: {
  		first: function( elem, i ) {
  			return i === 0;
  		},
  
  		last: function( elem, i, match, array ) {
  			return i === array.length - 1;
  		},
  
  		even: function( elem, i ) {
  			return i % 2 === 0;
  		},
  
  		odd: function( elem, i ) {
  			return i % 2 === 1;
  		},
  
  		lt: function( elem, i, match ) {
  			return i < match[3] - 0;
  		},
  
  		gt: function( elem, i, match ) {
  			return i > match[3] - 0;
  		},
  
  		nth: function( elem, i, match ) {
  			return match[3] - 0 === i;
  		},
  
  		eq: function( elem, i, match ) {
  			return match[3] - 0 === i;
  		}
  	},
  	filter: {
  		PSEUDO: function( elem, match, i, array ) {
  			var name = match[1],
  				filter = Expr.filters[ name ];
  
  			if ( filter ) {
  				return filter( elem, i, match, array );
  
  			} else if ( name === "contains" ) {
  				return (elem.textContent || elem.innerText || getText([ elem ]) || "").indexOf(match[3]) >= 0;
  
  			} else if ( name === "not" ) {
  				var not = match[3];
  
  				for ( var j = 0, l = not.length; j < l; j++ ) {
  					if ( not[j] === elem ) {
  						return false;
  					}
  				}
  
  				return true;
  
  			} else {
  				Sizzle.error( name );
  			}
  		},
  
  		CHILD: function( elem, match ) {
  			var first, last,
  				doneName, parent, cache,
  				count, diff,
  				type = match[1],
  				node = elem;
  
  			switch ( type ) {
  				case "only":
  				case "first":
  					while ( (node = node.previousSibling) ) {
  						if ( node.nodeType === 1 ) {
  							return false;
  						}
  					}
  
  					if ( type === "first" ) {
  						return true;
  					}
  
  					node = elem;
  
  					/* falls through */
  				case "last":
  					while ( (node = node.nextSibling) ) {
  						if ( node.nodeType === 1 ) {
  							return false;
  						}
  					}
  
  					return true;
  
  				case "nth":
  					first = match[2];
  					last = match[3];
  
  					if ( first === 1 && last === 0 ) {
  						return true;
  					}
  
  					doneName = match[0];
  					parent = elem.parentNode;
  
  					if ( parent && (parent[ expando ] !== doneName || !elem.nodeIndex) ) {
  						count = 0;
  
  						for ( node = parent.firstChild; node; node = node.nextSibling ) {
  							if ( node.nodeType === 1 ) {
  								node.nodeIndex = ++count;
  							}
  						}
  
  						parent[ expando ] = doneName;
  					}
  
  					diff = elem.nodeIndex - last;
  
  					if ( first === 0 ) {
  						return diff === 0;
  
  					} else {
  						return ( diff % first === 0 && diff / first >= 0 );
  					}
  			}
  		},
  
  		ID: function( elem, match ) {
  			return elem.nodeType === 1 && elem.getAttribute("id") === match;
  		},
  
  		TAG: function( elem, match ) {
  			return (match === "*" && elem.nodeType === 1) || !!elem.nodeName && elem.nodeName.toLowerCase() === match;
  		},
  
  		CLASS: function( elem, match ) {
  			return (" " + (elem.className || elem.getAttribute("class")) + " ")
  				.indexOf( match ) > -1;
  		},
  
  		ATTR: function( elem, match ) {
  			var name = match[1],
  				result = Sizzle.attr ?
  					Sizzle.attr( elem, name ) :
  					Expr.attrHandle[ name ] ?
  					Expr.attrHandle[ name ]( elem ) :
  					elem[ name ] != null ?
  						elem[ name ] :
  						elem.getAttribute( name ),
  				value = result + "",
  				type = match[2],
  				check = match[4];
  
  			return result == null ?
  				type === "!=" :
  				!type && Sizzle.attr ?
  				result != null :
  				type === "=" ?
  				value === check :
  				type === "*=" ?
  				value.indexOf(check) >= 0 :
  				type === "~=" ?
  				(" " + value + " ").indexOf(check) >= 0 :
  				!check ?
  				value && result !== false :
  				type === "!=" ?
  				value !== check :
  				type === "^=" ?
  				value.indexOf(check) === 0 :
  				type === "$=" ?
  				value.substr(value.length - check.length) === check :
  				type === "|=" ?
  				value === check || value.substr(0, check.length + 1) === check + "-" :
  				false;
  		},
  
  		POS: function( elem, match, i, array ) {
  			var name = match[2],
  				filter = Expr.setFilters[ name ];
  
  			if ( filter ) {
  				return filter( elem, i, match, array );
  			}
  		}
  	}
  };
  
  var origPOS = Expr.match.POS,
  	fescape = function(all, num){
  		return "\\" + (num - 0 + 1);
  	};
  
  for ( var type in Expr.match ) {
  	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
  	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
  }
  // Expose origPOS
  // "global" as in regardless of relation to brackets/parens
  Expr.match.globalPOS = origPOS;
  
  var makeArray = function( array, results ) {
  	array = Array.prototype.slice.call( array, 0 );
  
  	if ( results ) {
  		results.push.apply( results, array );
  		return results;
  	}
  
  	return array;
  };
  
  // Perform a simple check to determine if the browser is capable of
  // converting a NodeList to an array using builtin methods.
  // Also verifies that the returned array holds DOM nodes
  // (which is not the case in the Blackberry browser)
  try {
  	Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;
  
  // Provide a fallback method if it does not work
  } catch( e ) {
  	makeArray = function( array, results ) {
  		var i = 0,
  			ret = results || [];
  
  		if ( toString.call(array) === "[object Array]" ) {
  			Array.prototype.push.apply( ret, array );
  
  		} else {
  			if ( typeof array.length === "number" ) {
  				for ( var l = array.length; i < l; i++ ) {
  					ret.push( array[i] );
  				}
  
  			} else {
  				for ( ; array[i]; i++ ) {
  					ret.push( array[i] );
  				}
  			}
  		}
  
  		return ret;
  	};
  }
  
  var sortOrder, siblingCheck;
  
  if ( document.documentElement.compareDocumentPosition ) {
  	sortOrder = function( a, b ) {
  		if ( a === b ) {
  			hasDuplicate = true;
  			return 0;
  		}
  
  		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
  			return a.compareDocumentPosition ? -1 : 1;
  		}
  
  		return a.compareDocumentPosition(b) & 4 ? -1 : 1;
  	};
  
  } else {
  	sortOrder = function( a, b ) {
  		// The nodes are identical, we can exit early
  		if ( a === b ) {
  			hasDuplicate = true;
  			return 0;
  
  		// Fallback to using sourceIndex (in IE) if it's available on both nodes
  		} else if ( a.sourceIndex && b.sourceIndex ) {
  			return a.sourceIndex - b.sourceIndex;
  		}
  
  		var al, bl,
  			ap = [],
  			bp = [],
  			aup = a.parentNode,
  			bup = b.parentNode,
  			cur = aup;
  
  		// If the nodes are siblings (or identical) we can do a quick check
  		if ( aup === bup ) {
  			return siblingCheck( a, b );
  
  		// If no parents were found then the nodes are disconnected
  		} else if ( !aup ) {
  			return -1;
  
  		} else if ( !bup ) {
  			return 1;
  		}
  
  		// Otherwise they're somewhere else in the tree so we need
  		// to build up a full list of the parentNodes for comparison
  		while ( cur ) {
  			ap.unshift( cur );
  			cur = cur.parentNode;
  		}
  
  		cur = bup;
  
  		while ( cur ) {
  			bp.unshift( cur );
  			cur = cur.parentNode;
  		}
  
  		al = ap.length;
  		bl = bp.length;
  
  		// Start walking down the tree looking for a discrepancy
  		for ( var i = 0; i < al && i < bl; i++ ) {
  			if ( ap[i] !== bp[i] ) {
  				return siblingCheck( ap[i], bp[i] );
  			}
  		}
  
  		// We ended someplace up the tree so do a sibling check
  		return i === al ?
  			siblingCheck( a, bp[i], -1 ) :
  			siblingCheck( ap[i], b, 1 );
  	};
  
  	siblingCheck = function( a, b, ret ) {
  		if ( a === b ) {
  			return ret;
  		}
  
  		var cur = a.nextSibling;
  
  		while ( cur ) {
  			if ( cur === b ) {
  				return -1;
  			}
  
  			cur = cur.nextSibling;
  		}
  
  		return 1;
  	};
  }
  
  // Check to see if the browser returns elements by name when
  // querying by getElementById (and provide a workaround)
  (function(){
  	// We're going to inject a fake input element with a specified name
  	var form = document.createElement("div"),
  		id = "script" + (new Date()).getTime(),
  		root = document.documentElement;
  
  	form.innerHTML = "<a name='" + id + "'/>";
  
  	// Inject it into the root element, check its status, and remove it quickly
  	root.insertBefore( form, root.firstChild );
  
  	// The workaround has to do additional checks after a getElementById
  	// Which slows things down for other browsers (hence the branching)
  	if ( document.getElementById( id ) ) {
  		Expr.find.ID = function( match, context, isXML ) {
  			if ( typeof context.getElementById !== "undefined" && !isXML ) {
  				var m = context.getElementById(match[1]);
  
  				return m ?
  					m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
  						[m] :
  						undefined :
  					[];
  			}
  		};
  
  		Expr.filter.ID = function( elem, match ) {
  			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
  
  			return elem.nodeType === 1 && node && node.nodeValue === match;
  		};
  	}
  
  	root.removeChild( form );
  
  	// release memory in IE
  	root = form = null;
  })();
  
  (function(){
  	// Check to see if the browser returns only elements
  	// when doing getElementsByTagName("*")
  
  	// Create a fake element
  	var div = document.createElement("div");
  	div.appendChild( document.createComment("") );
  
  	// Make sure no comments are found
  	if ( div.getElementsByTagName("*").length > 0 ) {
  		Expr.find.TAG = function( match, context ) {
  			var results = context.getElementsByTagName( match[1] );
  
  			// Filter out possible comments
  			if ( match[1] === "*" ) {
  				var tmp = [];
  
  				for ( var i = 0; results[i]; i++ ) {
  					if ( results[i].nodeType === 1 ) {
  						tmp.push( results[i] );
  					}
  				}
  
  				results = tmp;
  			}
  
  			return results;
  		};
  	}
  
  	// Check to see if an attribute returns normalized href attributes
  	div.innerHTML = "<a href='#'></a>";
  
  	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
  			div.firstChild.getAttribute("href") !== "#" ) {
  
  		Expr.attrHandle.href = function( elem ) {
  			return elem.getAttribute( "href", 2 );
  		};
  	}
  
  	// release memory in IE
  	div = null;
  })();
  
  if ( document.querySelectorAll ) {
  	(function(){
  		var oldSizzle = Sizzle,
  			div = document.createElement("div"),
  			id = "__sizzle__";
  
  		div.innerHTML = "<p class='TEST'></p>";
  
  		// Safari can't handle uppercase or unicode characters when
  		// in quirks mode.
  		if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
  			return;
  		}
  
  		Sizzle = function( query, context, extra, seed ) {
  			context = context || document;
  
  			// Only use querySelectorAll on non-XML documents
  			// (ID selectors don't work in non-HTML documents)
  			if ( !seed && !Sizzle.isXML(context) ) {
  				// See if we find a selector to speed up
  				var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec( query );
  
  				if ( match && (context.nodeType === 1 || context.nodeType === 9) ) {
  					// Speed-up: Sizzle("TAG")
  					if ( match[1] ) {
  						return makeArray( context.getElementsByTagName( query ), extra );
  
  					// Speed-up: Sizzle(".CLASS")
  					} else if ( match[2] && Expr.find.CLASS && context.getElementsByClassName ) {
  						return makeArray( context.getElementsByClassName( match[2] ), extra );
  					}
  				}
  
  				if ( context.nodeType === 9 ) {
  					// Speed-up: Sizzle("body")
  					// The body element only exists once, optimize finding it
  					if ( query === "body" && context.body ) {
  						return makeArray( [ context.body ], extra );
  
  					// Speed-up: Sizzle("#ID")
  					} else if ( match && match[3] ) {
  						var elem = context.getElementById( match[3] );
  
  						// Check parentNode to catch when Blackberry 4.6 returns
  						// nodes that are no longer in the document #6963
  						if ( elem && elem.parentNode ) {
  							// Handle the case where IE and Opera return items
  							// by name instead of ID
  							if ( elem.id === match[3] ) {
  								return makeArray( [ elem ], extra );
  							}
  
  						} else {
  							return makeArray( [], extra );
  						}
  					}
  
  					try {
  						return makeArray( context.querySelectorAll(query), extra );
  					} catch(qsaError) {}
  
  				// qSA works strangely on Element-rooted queries
  				// We can work around this by specifying an extra ID on the root
  				// and working up from there (Thanks to Andrew Dupont for the technique)
  				// IE 8 doesn't work on object elements
  				} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
  					var oldContext = context,
  						old = context.getAttribute( "id" ),
  						nid = old || id,
  						hasParent = context.parentNode,
  						relativeHierarchySelector = /^\s*[+~]/.test( query );
  
  					if ( !old ) {
  						context.setAttribute( "id", nid );
  					} else {
  						nid = nid.replace( /'/g, "\\$&" );
  					}
  					if ( relativeHierarchySelector && hasParent ) {
  						context = context.parentNode;
  					}
  
  					try {
  						if ( !relativeHierarchySelector || hasParent ) {
  							return makeArray( context.querySelectorAll( "[id='" + nid + "'] " + query ), extra );
  						}
  
  					} catch(pseudoError) {
  					} finally {
  						if ( !old ) {
  							oldContext.removeAttribute( "id" );
  						}
  					}
  				}
  			}
  
  			return oldSizzle(query, context, extra, seed);
  		};
  
  		for ( var prop in oldSizzle ) {
  			Sizzle[ prop ] = oldSizzle[ prop ];
  		}
  
  		// release memory in IE
  		div = null;
  	})();
  }
  
  (function(){
  	var html = document.documentElement,
  		matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;
  
  	if ( matches ) {
  		// Check to see if it's possible to do matchesSelector
  		// on a disconnected node (IE 9 fails this)
  		var disconnectedMatch = !matches.call( document.createElement( "div" ), "div" ),
  			pseudoWorks = false;
  
  		try {
  			// This should fail with an exception
  			// Gecko does not error, returns false instead
  			matches.call( document.documentElement, "[test!='']:sizzle" );
  
  		} catch( pseudoError ) {
  			pseudoWorks = true;
  		}
  
  		Sizzle.matchesSelector = function( node, expr ) {
  			// Make sure that attribute selectors are quoted
  			expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");
  
  			if ( !Sizzle.isXML( node ) ) {
  				try {
  					if ( pseudoWorks || !Expr.match.PSEUDO.test( expr ) && !/!=/.test( expr ) ) {
  						var ret = matches.call( node, expr );
  
  						// IE 9's matchesSelector returns false on disconnected nodes
  						if ( ret || !disconnectedMatch ||
  								// As well, disconnected nodes are said to be in a document
  								// fragment in IE 9, so check for that
  								node.document && node.document.nodeType !== 11 ) {
  							return ret;
  						}
  					}
  				} catch(e) {}
  			}
  
  			return Sizzle(expr, null, null, [node]).length > 0;
  		};
  	}
  })();
  
  (function(){
  	var div = document.createElement("div");
  
  	div.innerHTML = "<div class='test e'></div><div class='test'></div>";
  
  	// Opera can't find a second classname (in 9.6)
  	// Also, make sure that getElementsByClassName actually exists
  	if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
  		return;
  	}
  
  	// Safari caches class attributes, doesn't catch changes (in 3.2)
  	div.lastChild.className = "e";
  
  	if ( div.getElementsByClassName("e").length === 1 ) {
  		return;
  	}
  
  	Expr.order.splice(1, 0, "CLASS");
  	Expr.find.CLASS = function( match, context, isXML ) {
  		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
  			return context.getElementsByClassName(match[1]);
  		}
  	};
  
  	// release memory in IE
  	div = null;
  })();
  
  function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
  	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
  		var elem = checkSet[i];
  
  		if ( elem ) {
  			var match = false;
  
  			elem = elem[dir];
  
  			while ( elem ) {
  				if ( elem[ expando ] === doneName ) {
  					match = checkSet[elem.sizset];
  					break;
  				}
  
  				if ( elem.nodeType === 1 && !isXML ){
  					elem[ expando ] = doneName;
  					elem.sizset = i;
  				}
  
  				if ( elem.nodeName.toLowerCase() === cur ) {
  					match = elem;
  					break;
  				}
  
  				elem = elem[dir];
  			}
  
  			checkSet[i] = match;
  		}
  	}
  }
  
  function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
  	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
  		var elem = checkSet[i];
  
  		if ( elem ) {
  			var match = false;
  
  			elem = elem[dir];
  
  			while ( elem ) {
  				if ( elem[ expando ] === doneName ) {
  					match = checkSet[elem.sizset];
  					break;
  				}
  
  				if ( elem.nodeType === 1 ) {
  					if ( !isXML ) {
  						elem[ expando ] = doneName;
  						elem.sizset = i;
  					}
  
  					if ( typeof cur !== "string" ) {
  						if ( elem === cur ) {
  							match = true;
  							break;
  						}
  
  					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
  						match = elem;
  						break;
  					}
  				}
  
  				elem = elem[dir];
  			}
  
  			checkSet[i] = match;
  		}
  	}
  }
  
  if ( document.documentElement.contains ) {
  	Sizzle.contains = function( a, b ) {
  		return a !== b && (a.contains ? a.contains(b) : true);
  	};
  
  } else if ( document.documentElement.compareDocumentPosition ) {
  	Sizzle.contains = function( a, b ) {
  		return !!(a.compareDocumentPosition(b) & 16);
  	};
  
  } else {
  	Sizzle.contains = function() {
  		return false;
  	};
  }
  
  Sizzle.isXML = function( elem ) {
  	// documentElement is verified for cases where it doesn't yet exist
  	// (such as loading iframes in IE - #4833)
  	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
  
  	return documentElement ? documentElement.nodeName !== "HTML" : false;
  };
  
  var posProcess = function( selector, context, seed ) {
  	var match,
  		tmpSet = [],
  		later = "",
  		root = context.nodeType ? [context] : context;
  
  	// Position selectors must be done after the filter
  	// And so must :not(positional) so we move all PSEUDOs to the end
  	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
  		later += match[0];
  		selector = selector.replace( Expr.match.PSEUDO, "" );
  	}
  
  	selector = Expr.relative[selector] ? selector + "*" : selector;
  
  	for ( var i = 0, l = root.length; i < l; i++ ) {
  		Sizzle( selector, root[i], tmpSet, seed );
  	}
  
  	return Sizzle.filter( later, tmpSet );
  };
  
  // EXPOSE
  
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Sizzle;
  } else {
    window.Sizzle = Sizzle;
  }
  
  })();
  

  provide("sizzle", module.exports);

  !function (doc, html, $) {
    // A bunch of this code is borrowed from Qwery so Sizzle acts as a drop-in replacement
    // and can handle the same argument types for $() as Qwery.
    // Similar code can be found in NWMatcher's bridge
    var sizzle = require('sizzle')
      , isNode = function (el, t) {
          return el && typeof el === 'object' && (t = el.nodeType) && (t == 1 || t == 9)
        }
      , arrayLike = function (o) {
          return (typeof o === 'object' && isFinite(o.length))
        }
      , flatten = function (ar) {
          for (var r = [], i = 0, l = ar.length; i < l; ++i) arrayLike(ar[i]) ? (r = r.concat(ar[i])) : (r[r.length] = ar[i])
          return r
        }
      , uniq = function (ar) {
          var a = [], i, j
          o: for (i = 0; i < ar.length; ++i) {
            for (j = 0; j < a.length; ++j) {
              if (a[j] == ar[i]) continue o
            }
            a[a.length] = ar[i]
          }
          return a
        }
      , normalizeRoot = function (root) {
          if (!root) return doc
          if (typeof root == 'string') return sizzle(root)[0]
          if (!root.nodeType && arrayLike(root)) return root[0]
          return root
        }
      , isAncestor = 'compareDocumentPosition' in html ?
          function (element, container) {
            return (container.compareDocumentPosition(element) & 16) == 16
          } : 'contains' in html ?
          function (element, container) {
            container = container.nodeType === 9 || container == window ? html : container
            return container !== element && container.contains(element)
          } :
          function (element, container) {
            while (element = element.parentNode) if (element === container) return 1
            return 0
          }
      , select = function (selector, _root) {
          var root = normalizeRoot(_root)
          if (!root || !selector) return []
          if (selector === window || isNode(selector)) {
            return !_root || (selector !== window && isNode(root) && isAncestor(root, container)) ? [selector] : []
          }
          if (selector && arrayLike(selector)) return flatten(selector)
          return sizzle(selector, root)
        }
      , is = function (s) {
          var i, l
          for (i = 0, l = this.length; i < l; i++) {
            if (sizzle.matchesSelector(this[i], s))
              return true
          }
          return false
        }
  
    $._select = function (selector, root) {
      // if 'bonzo' is available at run-time use it for <element> creation
      return ($._select = (function(bonzo) {
        try {
          bonzo = require('bonzo')
          return function (selector, root) {
            return /^\s*</.test(selector) ? bonzo.create(selector, root) : select(selector, root)
          }
        } catch (e) { }
        return select
      })())(selector, root)
    }
  
    $.ender({
        // boolean, does at least one element in the collection match the given selector
        is: is
      , matchesSelector: is
        // find all elements that are children of the elements in this collection matching
        // the given selector
      , find: function (s) {
          var r = [], i = 0, l = this.length
          for (; i < l; i++)
            r = r.concat(select(s, this[i]))
          return $(uniq(r))
        }
        // add additional elements to this collection matching the given selector
      , and: function (s, r) {
          var plus = select(s, r)
            , i = this.length
            , l = this.length + plus.length
            , j = 0
          for (; i < l; i++, j++)
            this[i] = plus[j]
          return $(uniq(this))
        }
    }, true)
  
  }(document, document.documentElement, ender)
  

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  'use strict';
  
  exports.CSSStyleDeclaration = require('./CSSStyleDeclaration').CSSStyleDeclaration;
  exports.CSSRule = require('./CSSRule').CSSRule;
  exports.CSSStyleRule = require('./CSSStyleRule').CSSStyleRule;
  exports.MediaList = require('./MediaList').MediaList;
  exports.CSSMediaRule = require('./CSSMediaRule').CSSMediaRule;
  exports.CSSImportRule = require('./CSSImportRule').CSSImportRule;
  exports.StyleSheet = require('./StyleSheet').StyleSheet;
  exports.CSSStyleSheet = require('./CSSStyleSheet').CSSStyleSheet;
  exports.CSSKeyframesRule = require('./CSSKeyframesRule').CSSKeyframesRule;
  exports.CSSKeyframeRule = require('./CSSKeyframeRule').CSSKeyframeRule;
  exports.parse = require('./parse').parse;
  exports.clone = require('./clone').clone;
  

  provide("cssom", module.exports);

  $.ender(module.exports);

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /***********************************************
  Copyright 2010, 2011, Chris Winberry <chris@winberry.net>. All rights reserved.
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to
  deal in the Software without restriction, including without limitation the
  rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
  sell copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
  IN THE SOFTWARE.
  ***********************************************/
  /* v1.7.6 */
  
  (function () {
  
  function runningInNode () {
  	return(
  		(typeof require) == "function"
  		&&
  		(typeof exports) == "object"
  		&&
  		(typeof module) == "object"
  		&&
  		(typeof __filename) == "string"
  		&&
  		(typeof __dirname) == "string"
  		);
  }
  
  if (!runningInNode()) {
  	if (!this.Tautologistics)
  		this.Tautologistics = {};
  	else if (this.Tautologistics.NodeHtmlParser)
  		return; //NodeHtmlParser already defined!
  	this.Tautologistics.NodeHtmlParser = {};
  	exports = this.Tautologistics.NodeHtmlParser;
  }
  
  //Types of elements found in the DOM
  var ElementType = {
  	  Text: "text" //Plain text
  	, Directive: "directive" //Special tag <!...>
  	, Comment: "comment" //Special tag <!--...-->
  	, Script: "script" //Special tag <script>...</script>
  	, Style: "style" //Special tag <style>...</style>
  	, Tag: "tag" //Any tag that isn't special
  }
  
  function Parser (handler, options) {
  	this._options = options ? options : { };
  	if (this._options.includeLocation == undefined) {
  		this._options.includeLocation = false; //Do not track element position in document by default
  	}
  
  	this.validateHandler(handler);
  	this._handler = handler;
  	this.reset();
  }
  
  	//**"Static"**//
  	//Regular expressions used for cleaning up and parsing (stateless)
  	Parser._reTrim = /(^\s+|\s+$)/g; //Trim leading/trailing whitespace
  	Parser._reTrimComment = /(^\!--|--$)/g; //Remove comment tag markup from comment contents
  	Parser._reWhitespace = /\s/g; //Used to find any whitespace to split on
  	Parser._reTagName = /^\s*(\/?)\s*([^\s\/]+)/; //Used to find the tag name for an element
  
  	//Regular expressions used for parsing (stateful)
  	Parser._reAttrib = //Find attributes in a tag
  		/([^=<>\"\'\s]+)\s*=\s*"([^"]*)"|([^=<>\"\'\s]+)\s*=\s*'([^']*)'|([^=<>\"\'\s]+)\s*=\s*([^'"\s]+)|([^=<>\"\'\s\/]+)/g;
  	Parser._reTags = /[\<\>]/g; //Find tag markers
  
  	//**Public**//
  	//Methods//
  	//Parses a complete HTML and pushes it to the handler
  	Parser.prototype.parseComplete = function Parser$parseComplete (data) {
  		this.reset();
  		this.parseChunk(data);
  		this.done();
  	}
  
  	//Parses a piece of an HTML document
  	Parser.prototype.parseChunk = function Parser$parseChunk (data) {
  		if (this._done)
  			this.handleError(new Error("Attempted to parse chunk after parsing already done"));
  		this._buffer += data; //FIXME: this can be a bottleneck
  		this.parseTags();
  	}
  
  	//Tells the parser that the HTML being parsed is complete
  	Parser.prototype.done = function Parser$done () {
  		if (this._done)
  			return;
  		this._done = true;
  	
  		//Push any unparsed text into a final element in the element list
  		if (this._buffer.length) {
  			var rawData = this._buffer;
  			this._buffer = "";
  			var element = {
  				  raw: rawData
  				, data: (this._parseState == ElementType.Text) ? rawData : rawData.replace(Parser._reTrim, "")
  				, type: this._parseState
  				};
  			if (this._parseState == ElementType.Tag || this._parseState == ElementType.Script || this._parseState == ElementType.Style)
  				element.name = this.parseTagName(element.data);
  			this.parseAttribs(element);
  			this._elements.push(element);
  		}
  	
  		this.writeHandler();
  		this._handler.done();
  	}
  
  	//Resets the parser to a blank state, ready to parse a new HTML document
  	Parser.prototype.reset = function Parser$reset () {
  		this._buffer = "";
  		this._done = false;
  		this._elements = [];
  		this._elementsCurrent = 0;
  		this._current = 0;
  		this._next = 0;
  		this._location = {
  			  row: 0
  			, col: 0
  			, charOffset: 0
  			, inBuffer: 0
  		};
  		this._parseState = ElementType.Text;
  		this._prevTagSep = '';
  		this._tagStack = [];
  		this._handler.reset();
  	}
  	
  	//**Private**//
  	//Properties//
  	Parser.prototype._options = null; //Parser options for how to behave
  	Parser.prototype._handler = null; //Handler for parsed elements
  	Parser.prototype._buffer = null; //Buffer of unparsed data
  	Parser.prototype._done = false; //Flag indicating whether parsing is done
  	Parser.prototype._elements =  null; //Array of parsed elements
  	Parser.prototype._elementsCurrent = 0; //Pointer to last element in _elements that has been processed
  	Parser.prototype._current = 0; //Position in data that has already been parsed
  	Parser.prototype._next = 0; //Position in data of the next tag marker (<>)
  	Parser.prototype._location = null; //Position tracking for elements in a stream
  	Parser.prototype._parseState = ElementType.Text; //Current type of element being parsed
  	Parser.prototype._prevTagSep = ''; //Previous tag marker found
  	//Stack of element types previously encountered; keeps track of when
  	//parsing occurs inside a script/comment/style tag
  	Parser.prototype._tagStack = null;
  
  	//Methods//
  	//Takes an array of elements and parses any found attributes
  	Parser.prototype.parseTagAttribs = function Parser$parseTagAttribs (elements) {
  		var idxEnd = elements.length;
  		var idx = 0;
  	
  		while (idx < idxEnd) {
  			var element = elements[idx++];
  			if (element.type == ElementType.Tag || element.type == ElementType.Script || element.type == ElementType.style)
  				this.parseAttribs(element);
  		}
  	
  		return(elements);
  	}
  
  	//Takes an element and adds an "attribs" property for any element attributes found 
  	Parser.prototype.parseAttribs = function Parser$parseAttribs (element) {
  		//Only parse attributes for tags
  		if (element.type != ElementType.Script && element.type != ElementType.Style && element.type != ElementType.Tag)
  			return;
  	
  		var tagName = element.data.split(Parser._reWhitespace, 1)[0];
  		var attribRaw = element.data.substring(tagName.length);
  		if (attribRaw.length < 1)
  			return;
  	
  		var match;
  		Parser._reAttrib.lastIndex = 0;
  		while (match = Parser._reAttrib.exec(attribRaw)) {
  			if (element.attribs == undefined)
  				element.attribs = {};
  	
  			if (typeof match[1] == "string" && match[1].length) {
  				element.attribs[match[1]] = match[2];
  			} else if (typeof match[3] == "string" && match[3].length) {
  				element.attribs[match[3].toString()] = match[4].toString();
  			} else if (typeof match[5] == "string" && match[5].length) {
  				element.attribs[match[5]] = match[6];
  			} else if (typeof match[7] == "string" && match[7].length) {
  				element.attribs[match[7]] = match[7];
  			}
  		}
  	}
  
  	//Extracts the base tag name from the data value of an element
  	Parser.prototype.parseTagName = function Parser$parseTagName (data) {
  		if (data == null || data == "")
  			return("");
  		var match = Parser._reTagName.exec(data);
  		if (!match)
  			return("");
  		return((match[1] ? "/" : "") + match[2]);
  	}
  
  	//Parses through HTML text and returns an array of found elements
  	//I admit, this function is rather large but splitting up had an noticeable impact on speed
  	Parser.prototype.parseTags = function Parser$parseTags () {
  		var bufferEnd = this._buffer.length - 1;
  		while (Parser._reTags.test(this._buffer)) {
  			this._next = Parser._reTags.lastIndex - 1;
  			var tagSep = this._buffer.charAt(this._next); //The currently found tag marker
  			var rawData = this._buffer.substring(this._current, this._next); //The next chunk of data to parse
  	
  			//A new element to eventually be appended to the element list
  			var element = {
  				  raw: rawData
  				, data: (this._parseState == ElementType.Text) ? rawData : rawData.replace(Parser._reTrim, "")
  				, type: this._parseState
  			};
  	
  			var elementName = this.parseTagName(element.data);
  	
  			//This section inspects the current tag stack and modifies the current
  			//element if we're actually parsing a special area (script/comment/style tag)
  			if (this._tagStack.length) { //We're parsing inside a script/comment/style tag
  				if (this._tagStack[this._tagStack.length - 1] == ElementType.Script) { //We're currently in a script tag
  					if (elementName.toLowerCase() == "/script") //Actually, we're no longer in a script tag, so pop it off the stack
  						this._tagStack.pop();
  					else { //Not a closing script tag
  						if (element.raw.indexOf("!--") != 0) { //Make sure we're not in a comment
  							//All data from here to script close is now a text element
  							element.type = ElementType.Text;
  							//If the previous element is text, append the current text to it
  							if (this._elements.length && this._elements[this._elements.length - 1].type == ElementType.Text) {
  								var prevElement = this._elements[this._elements.length - 1];
  								prevElement.raw = prevElement.data = prevElement.raw + this._prevTagSep + element.raw;
  								element.raw = element.data = ""; //This causes the current element to not be added to the element list
  							}
  						}
  					}
  				}
  				else if (this._tagStack[this._tagStack.length - 1] == ElementType.Style) { //We're currently in a style tag
  					if (elementName.toLowerCase() == "/style") //Actually, we're no longer in a style tag, so pop it off the stack
  						this._tagStack.pop();
  					else {
  						if (element.raw.indexOf("!--") != 0) { //Make sure we're not in a comment
  							//All data from here to style close is now a text element
  							element.type = ElementType.Text;
  							//If the previous element is text, append the current text to it
  							if (this._elements.length && this._elements[this._elements.length - 1].type == ElementType.Text) {
  								var prevElement = this._elements[this._elements.length - 1];
  								if (element.raw != "") {
  									prevElement.raw = prevElement.data = prevElement.raw + this._prevTagSep + element.raw;
  									element.raw = element.data = ""; //This causes the current element to not be added to the element list
  								} else { //Element is empty, so just append the last tag marker found
  									prevElement.raw = prevElement.data = prevElement.raw + this._prevTagSep;
  								}
  							} else { //The previous element was not text
  								if (element.raw != "") {
  									element.raw = element.data = element.raw;
  								}
  							}
  						}
  					}
  				}
  				else if (this._tagStack[this._tagStack.length - 1] == ElementType.Comment) { //We're currently in a comment tag
  					var rawLen = element.raw.length;
  					if (element.raw.charAt(rawLen - 2) == "-" && element.raw.charAt(rawLen - 1) == "-" && tagSep == ">") {
  						//Actually, we're no longer in a style tag, so pop it off the stack
  						this._tagStack.pop();
  						//If the previous element is a comment, append the current text to it
  						if (this._elements.length && this._elements[this._elements.length - 1].type == ElementType.Comment) {
  							var prevElement = this._elements[this._elements.length - 1];
  							prevElement.raw = prevElement.data = (prevElement.raw + element.raw).replace(Parser._reTrimComment, "");
  							element.raw = element.data = ""; //This causes the current element to not be added to the element list
  							element.type = ElementType.Text;
  						}
  						else //Previous element not a comment
  							element.type = ElementType.Comment; //Change the current element's type to a comment
  					}
  					else { //Still in a comment tag
  						element.type = ElementType.Comment;
  						//If the previous element is a comment, append the current text to it
  						if (this._elements.length && this._elements[this._elements.length - 1].type == ElementType.Comment) {
  							var prevElement = this._elements[this._elements.length - 1];
  							prevElement.raw = prevElement.data = prevElement.raw + element.raw + tagSep;
  							element.raw = element.data = ""; //This causes the current element to not be added to the element list
  							element.type = ElementType.Text;
  						}
  						else
  							element.raw = element.data = element.raw + tagSep;
  					}
  				}
  			}
  	
  			//Processing of non-special tags
  			if (element.type == ElementType.Tag) {
  				element.name = elementName;
  				var elementNameCI = elementName.toLowerCase();
  				
  				if (element.raw.indexOf("!--") == 0) { //This tag is really comment
  					element.type = ElementType.Comment;
  					delete element["name"];
  					var rawLen = element.raw.length;
  					//Check if the comment is terminated in the current element
  					if (element.raw.charAt(rawLen - 1) == "-" && element.raw.charAt(rawLen - 2) == "-" && tagSep == ">")
  						element.raw = element.data = element.raw.replace(Parser._reTrimComment, "");
  					else { //It's not so push the comment onto the tag stack
  						element.raw += tagSep;
  						this._tagStack.push(ElementType.Comment);
  					}
  				}
  				else if (element.raw.indexOf("!") == 0 || element.raw.indexOf("?") == 0) {
  					element.type = ElementType.Directive;
  					//TODO: what about CDATA?
  				}
  				else if (elementNameCI == "script") {
  					element.type = ElementType.Script;
  					//Special tag, push onto the tag stack if not terminated
  					if (element.data.charAt(element.data.length - 1) != "/")
  						this._tagStack.push(ElementType.Script);
  				}
  				else if (elementNameCI == "/script")
  					element.type = ElementType.Script;
  				else if (elementNameCI == "style") {
  					element.type = ElementType.Style;
  					//Special tag, push onto the tag stack if not terminated
  					if (element.data.charAt(element.data.length - 1) != "/")
  						this._tagStack.push(ElementType.Style);
  				}
  				else if (elementNameCI == "/style")
  					element.type = ElementType.Style;
  				if (element.name && element.name.charAt(0) == "/")
  					element.data = element.name;
  			}
  	
  			//Add all tags and non-empty text elements to the element list
  			if (element.raw != "" || element.type != ElementType.Text) {
  				if (this._options.includeLocation && !element.location) {
  					element.location = this.getLocation(element.type == ElementType.Tag);
  				}
  				this.parseAttribs(element);
  				this._elements.push(element);
  				//If tag self-terminates, add an explicit, separate closing tag
  				if (
  					element.type != ElementType.Text
  					&&
  					element.type != ElementType.Comment
  					&&
  					element.type != ElementType.Directive
  					&&
  					element.data.charAt(element.data.length - 1) == "/"
  					)
  					this._elements.push({
  						  raw: "/" + element.name
  						, data: "/" + element.name
  						, name: "/" + element.name
  						, type: element.type
  					});
  			}
  			this._parseState = (tagSep == "<") ? ElementType.Tag : ElementType.Text;
  			this._current = this._next + 1;
  			this._prevTagSep = tagSep;
  		}
  
  		if (this._options.includeLocation) {
  			this.getLocation();
  			this._location.row += this._location.inBuffer;
  			this._location.inBuffer = 0;
  			this._location.charOffset = 0;
  		}
  		this._buffer = (this._current <= bufferEnd) ? this._buffer.substring(this._current) : "";
  		this._current = 0;
  	
  		this.writeHandler();
  	}
  
  	Parser.prototype.getLocation = function Parser$getLocation (startTag) {
  		var c,
  			l = this._location,
  			end = this._current - (startTag ? 1 : 0),
  			chunk = startTag && l.charOffset == 0 && this._current == 0;
  		
  		for (; l.charOffset < end; l.charOffset++) {
  			c = this._buffer.charAt(l.charOffset);
  			if (c == '\n') {
  				l.inBuffer++;
  				l.col = 0;
  			} else if (c != '\r') {
  				l.col++;
  			}
  		}
  		return {
  			  line: l.row + l.inBuffer + 1
  			, col: l.col + (chunk ? 0: 1)
  		};
  	}
  
  	//Checks the handler to make it is an object with the right "interface"
  	Parser.prototype.validateHandler = function Parser$validateHandler (handler) {
  		if ((typeof handler) != "object")
  			throw new Error("Handler is not an object");
  		if ((typeof handler.reset) != "function")
  			throw new Error("Handler method 'reset' is invalid");
  		if ((typeof handler.done) != "function")
  			throw new Error("Handler method 'done' is invalid");
  		if ((typeof handler.writeTag) != "function")
  			throw new Error("Handler method 'writeTag' is invalid");
  		if ((typeof handler.writeText) != "function")
  			throw new Error("Handler method 'writeText' is invalid");
  		if ((typeof handler.writeComment) != "function")
  			throw new Error("Handler method 'writeComment' is invalid");
  		if ((typeof handler.writeDirective) != "function")
  			throw new Error("Handler method 'writeDirective' is invalid");
  	}
  
  	//Writes parsed elements out to the handler
  	Parser.prototype.writeHandler = function Parser$writeHandler (forceFlush) {
  		forceFlush = !!forceFlush;
  		if (this._tagStack.length && !forceFlush)
  			return;
  		while (this._elements.length) {
  			var element = this._elements.shift();
  			switch (element.type) {
  				case ElementType.Comment:
  					this._handler.writeComment(element);
  					break;
  				case ElementType.Directive:
  					this._handler.writeDirective(element);
  					break;
  				case ElementType.Text:
  					this._handler.writeText(element);
  					break;
  				default:
  					this._handler.writeTag(element);
  					break;
  			}
  		}
  	}
  
  	Parser.prototype.handleError = function Parser$handleError (error) {
  		if ((typeof this._handler.error) == "function")
  			this._handler.error(error);
  		else
  			throw error;
  	}
  
  //TODO: make this a trully streamable handler
  function RssHandler (callback) {
  	RssHandler.super_.call(this, callback, { ignoreWhitespace: true, verbose: false, enforceEmptyTags: false });
  }
  inherits(RssHandler, DefaultHandler);
  
  	RssHandler.prototype.done = function RssHandler$done () {
  		var feed = { };
  		var feedRoot;
  
  		var found = DomUtils.getElementsByTagName(function (value) { return(value == "rss" || value == "feed"); }, this.dom, false);
  		if (found.length) {
  			feedRoot = found[0];
  		}
  		if (feedRoot) {
  			if (feedRoot.name == "rss") {
  				feed.type = "rss";
  				feedRoot = feedRoot.children[0]; //<channel/>
  				feed.id = "";
  				try {
  					feed.title = DomUtils.getElementsByTagName("title", feedRoot.children, false)[0].children[0].data;
  				} catch (ex) { }
  				try {
  					feed.link = DomUtils.getElementsByTagName("link", feedRoot.children, false)[0].children[0].data;
  				} catch (ex) { }
  				try {
  					feed.description = DomUtils.getElementsByTagName("description", feedRoot.children, false)[0].children[0].data;
  				} catch (ex) { }
  				try {
  					feed.updated = new Date(DomUtils.getElementsByTagName("lastBuildDate", feedRoot.children, false)[0].children[0].data);
  				} catch (ex) { }
  				try {
  					feed.author = DomUtils.getElementsByTagName("managingEditor", feedRoot.children, false)[0].children[0].data;
  				} catch (ex) { }
  				feed.items = [];
  				DomUtils.getElementsByTagName("item", feedRoot.children).forEach(function (item, index, list) {
  					var entry = {};
  					try {
  						entry.id = DomUtils.getElementsByTagName("guid", item.children, false)[0].children[0].data;
  					} catch (ex) { }
  					try {
  						entry.title = DomUtils.getElementsByTagName("title", item.children, false)[0].children[0].data;
  					} catch (ex) { }
  					try {
  						entry.link = DomUtils.getElementsByTagName("link", item.children, false)[0].children[0].data;
  					} catch (ex) { }
  					try {
  						entry.description = DomUtils.getElementsByTagName("description", item.children, false)[0].children[0].data;
  					} catch (ex) { }
  					try {
  						entry.pubDate = new Date(DomUtils.getElementsByTagName("pubDate", item.children, false)[0].children[0].data);
  					} catch (ex) { }
  					feed.items.push(entry);
  				});
  			} else {
  				feed.type = "atom";
  				try {
  					feed.id = DomUtils.getElementsByTagName("id", feedRoot.children, false)[0].children[0].data;
  				} catch (ex) { }
  				try {
  					feed.title = DomUtils.getElementsByTagName("title", feedRoot.children, false)[0].children[0].data;
  				} catch (ex) { }
  				try {
  					feed.link = DomUtils.getElementsByTagName("link", feedRoot.children, false)[0].attribs.href;
  				} catch (ex) { }
  				try {
  					feed.description = DomUtils.getElementsByTagName("subtitle", feedRoot.children, false)[0].children[0].data;
  				} catch (ex) { }
  				try {
  					feed.updated = new Date(DomUtils.getElementsByTagName("updated", feedRoot.children, false)[0].children[0].data);
  				} catch (ex) { }
  				try {
  					feed.author = DomUtils.getElementsByTagName("email", feedRoot.children, true)[0].children[0].data;
  				} catch (ex) { }
  				feed.items = [];
  				DomUtils.getElementsByTagName("entry", feedRoot.children).forEach(function (item, index, list) {
  					var entry = {};
  					try {
  						entry.id = DomUtils.getElementsByTagName("id", item.children, false)[0].children[0].data;
  					} catch (ex) { }
  					try {
  						entry.title = DomUtils.getElementsByTagName("title", item.children, false)[0].children[0].data;
  					} catch (ex) { }
  					try {
  						entry.link = DomUtils.getElementsByTagName("link", item.children, false)[0].attribs.href;
  					} catch (ex) { }
  					try {
  						entry.description = DomUtils.getElementsByTagName("summary", item.children, false)[0].children[0].data;
  					} catch (ex) { }
  					try {
  						entry.pubDate = new Date(DomUtils.getElementsByTagName("updated", item.children, false)[0].children[0].data);
  					} catch (ex) { }
  					feed.items.push(entry);
  				});
  			}
  
  			this.dom = feed;
  		}
  		RssHandler.super_.prototype.done.call(this);
  	}
  
  ///////////////////////////////////////////////////
  
  function DefaultHandler (callback, options) {
  	this.reset();
  	this._options = options ? options : { };
  	if (this._options.ignoreWhitespace == undefined)
  		this._options.ignoreWhitespace = false; //Keep whitespace-only text nodes
  	if (this._options.verbose == undefined)
  		this._options.verbose = true; //Keep data property for tags and raw property for all
  	if (this._options.enforceEmptyTags == undefined)
  		this._options.enforceEmptyTags = true; //Don't allow children for HTML tags defined as empty in spec
  	if ((typeof callback) == "function")
  		this._callback = callback;
  }
  
  	//**"Static"**//
  	//HTML Tags that shouldn't contain child nodes
  	DefaultHandler._emptyTags = {
  		  area: 1
  		, base: 1
  		, basefont: 1
  		, br: 1
  		, col: 1
  		, frame: 1
  		, hr: 1
  		, img: 1
  		, input: 1
  		, isindex: 1
  		, link: 1
  		, meta: 1
  		, param: 1
  		, embed: 1
  	}
  	//Regex to detect whitespace only text nodes
  	DefaultHandler.reWhitespace = /^\s*$/;
  
  	//**Public**//
  	//Properties//
  	DefaultHandler.prototype.dom = null; //The hierarchical object containing the parsed HTML
  	//Methods//
  	//Resets the handler back to starting state
  	DefaultHandler.prototype.reset = function DefaultHandler$reset() {
  		this.dom = [];
  		this._done = false;
  		this._tagStack = [];
  		this._tagStack.last = function DefaultHandler$_tagStack$last () {
  			return(this.length ? this[this.length - 1] : null);
  		}
  	}
  	//Signals the handler that parsing is done
  	DefaultHandler.prototype.done = function DefaultHandler$done () {
  		this._done = true;
  		this.handleCallback(null);
  	}
  	DefaultHandler.prototype.writeTag = function DefaultHandler$writeTag (element) {
  		this.handleElement(element);
  	} 
  	DefaultHandler.prototype.writeText = function DefaultHandler$writeText (element) {
  		if (this._options.ignoreWhitespace)
  			if (DefaultHandler.reWhitespace.test(element.data))
  				return;
  		this.handleElement(element);
  	} 
  	DefaultHandler.prototype.writeComment = function DefaultHandler$writeComment (element) {
  		this.handleElement(element);
  	} 
  	DefaultHandler.prototype.writeDirective = function DefaultHandler$writeDirective (element) {
  		this.handleElement(element);
  	}
  	DefaultHandler.prototype.error = function DefaultHandler$error (error) {
  		this.handleCallback(error);
  	}
  
  	//**Private**//
  	//Properties//
  	DefaultHandler.prototype._options = null; //Handler options for how to behave
  	DefaultHandler.prototype._callback = null; //Callback to respond to when parsing done
  	DefaultHandler.prototype._done = false; //Flag indicating whether handler has been notified of parsing completed
  	DefaultHandler.prototype._tagStack = null; //List of parents to the currently element being processed
  	//Methods//
  	DefaultHandler.prototype.handleCallback = function DefaultHandler$handleCallback (error) {
  			if ((typeof this._callback) != "function")
  				if (error)
  					throw error;
  				else
  					return;
  			this._callback(error, this.dom);
  	}
  	
  	DefaultHandler.prototype.isEmptyTag = function(element) {
  		var name = element.name.toLowerCase();
  		if (name.charAt(0) == '/') {
  			name = name.substring(1);
  		}
  		return this._options.enforceEmptyTags && !!DefaultHandler._emptyTags[name];
  	};
  	
  	DefaultHandler.prototype.handleElement = function DefaultHandler$handleElement (element) {
  		if (this._done)
  			this.handleCallback(new Error("Writing to the handler after done() called is not allowed without a reset()"));
  		if (!this._options.verbose) {
  //			element.raw = null; //FIXME: Not clean
  			//FIXME: Serious performance problem using delete
  			delete element.raw;
  			if (element.type == "tag" || element.type == "script" || element.type == "style")
  				delete element.data;
  		}
  		if (!this._tagStack.last()) { //There are no parent elements
  			//If the element can be a container, add it to the tag stack and the top level list
  			if (element.type != ElementType.Text && element.type != ElementType.Comment && element.type != ElementType.Directive) {
  				if (element.name.charAt(0) != "/") { //Ignore closing tags that obviously don't have an opening tag
  					this.dom.push(element);
  					if (!this.isEmptyTag(element)) { //Don't add tags to the tag stack that can't have children
  						this._tagStack.push(element);
  					}
  				}
  			}
  			else //Otherwise just add to the top level list
  				this.dom.push(element);
  		}
  		else { //There are parent elements
  			//If the element can be a container, add it as a child of the element
  			//on top of the tag stack and then add it to the tag stack
  			if (element.type != ElementType.Text && element.type != ElementType.Comment && element.type != ElementType.Directive) {
  				if (element.name.charAt(0) == "/") {
  					//This is a closing tag, scan the tagStack to find the matching opening tag
  					//and pop the stack up to the opening tag's parent
  					var baseName = element.name.substring(1);
  					if (!this.isEmptyTag(element)) {
  						var pos = this._tagStack.length - 1;
  						while (pos > -1 && this._tagStack[pos--].name != baseName) { }
  						if (pos > -1 || this._tagStack[0].name == baseName)
  							while (pos < this._tagStack.length - 1)
  								this._tagStack.pop();
  					}
  				}
  				else { //This is not a closing tag
  					if (!this._tagStack.last().children)
  						this._tagStack.last().children = [];
  					this._tagStack.last().children.push(element);
  					if (!this.isEmptyTag(element)) //Don't add tags to the tag stack that can't have children
  						this._tagStack.push(element);
  				}
  			}
  			else { //This is not a container element
  				if (!this._tagStack.last().children)
  					this._tagStack.last().children = [];
  				this._tagStack.last().children.push(element);
  			}
  		}
  	}
  
  	var DomUtils = {
  		  testElement: function DomUtils$testElement (options, element) {
  			if (!element) {
  				return false;
  			}
  	
  			for (var key in options) {
  				if (key == "tag_name") {
  					if (element.type != "tag" && element.type != "script" && element.type != "style") {
  						return false;
  					}
  					if (!options["tag_name"](element.name)) {
  						return false;
  					}
  				} else if (key == "tag_type") {
  					if (!options["tag_type"](element.type)) {
  						return false;
  					}
  				} else if (key == "tag_contains") {
  					if (element.type != "text" && element.type != "comment" && element.type != "directive") {
  						return false;
  					}
  					if (!options["tag_contains"](element.data)) {
  						return false;
  					}
  				} else {
  					if (!element.attribs || !options[key](element.attribs[key])) {
  						return false;
  					}
  				}
  			}
  		
  			return true;
  		}
  	
  		, getElements: function DomUtils$getElements (options, currentElement, recurse, limit) {
  			recurse = (recurse === undefined || recurse === null) || !!recurse;
  			limit = isNaN(parseInt(limit)) ? -1 : parseInt(limit);
  
  			if (!currentElement) {
  				return([]);
  			}
  	
  			var found = [];
  			var elementList;
  
  			function getTest (checkVal) {
  				return(function (value) { return(value == checkVal); });
  			}
  			for (var key in options) {
  				if ((typeof options[key]) != "function") {
  					options[key] = getTest(options[key]);
  				}
  			}
  	
  			if (DomUtils.testElement(options, currentElement)) {
  				found.push(currentElement);
  			}
  
  			if (limit >= 0 && found.length >= limit) {
  				return(found);
  			}
  
  			if (recurse && currentElement.children) {
  				elementList = currentElement.children;
  			} else if (currentElement instanceof Array) {
  				elementList = currentElement;
  			} else {
  				return(found);
  			}
  	
  			for (var i = 0; i < elementList.length; i++) {
  				found = found.concat(DomUtils.getElements(options, elementList[i], recurse, limit));
  				if (limit >= 0 && found.length >= limit) {
  					break;
  				}
  			}
  	
  			return(found);
  		}
  		
  		, getElementById: function DomUtils$getElementById (id, currentElement, recurse) {
  			var result = DomUtils.getElements({ id: id }, currentElement, recurse, 1);
  			return(result.length ? result[0] : null);
  		}
  		
  		, getElementsByTagName: function DomUtils$getElementsByTagName (name, currentElement, recurse, limit) {
  			return(DomUtils.getElements({ tag_name: name }, currentElement, recurse, limit));
  		}
  		
  		, getElementsByTagType: function DomUtils$getElementsByTagType (type, currentElement, recurse, limit) {
  			return(DomUtils.getElements({ tag_type: type }, currentElement, recurse, limit));
  		}
  	}
  
  	function inherits (ctor, superCtor) {
  		var tempCtor = function(){};
  		tempCtor.prototype = superCtor.prototype;
  		ctor.super_ = superCtor;
  		ctor.prototype = new tempCtor();
  		ctor.prototype.constructor = ctor;
  	}
  
  exports.Parser = Parser;
  
  exports.DefaultHandler = DefaultHandler;
  
  exports.RssHandler = RssHandler;
  
  exports.ElementType = ElementType;
  
  exports.DomUtils = DomUtils;
  
  })();
  

  provide("htmlparser", module.exports);

  $.ender(module.exports);

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  // Copyright 2010-2012 Mikeal Rogers
  //
  //    Licensed under the Apache License, Version 2.0 (the "License");
  //    you may not use this file except in compliance with the License.
  //    You may obtain a copy of the License at
  //
  //        http://www.apache.org/licenses/LICENSE-2.0
  //
  //    Unless required by applicable law or agreed to in writing, software
  //    distributed under the License is distributed on an "AS IS" BASIS,
  //    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  //    See the License for the specific language governing permissions and
  //    limitations under the License.
  
  var http = require('http')
    , https = false
    , tls = false
    , url = require('url')
    , util = require('util')
    , stream = require('stream')
    , qs = require('querystring')
    , mimetypes = require('./mimetypes')
    , oauth = require('./oauth')
    , uuid = require('./uuid')
    , ForeverAgent = require('./forever')
    , Cookie = require('./vendor/cookie')
    , CookieJar = require('./vendor/cookie/jar')
    , cookieJar = new CookieJar
    , tunnel = require('./tunnel')
    ;
    
  if (process.logging) {
    var log = process.logging('request')
  }
  
  try {
    https = require('https')
  } catch (e) {}
  
  try {
    tls = require('tls')
  } catch (e) {}
  
  function toBase64 (str) {
    return (new Buffer(str || "", "ascii")).toString("base64")
  }
  
  // Hacky fix for pre-0.4.4 https
  if (https && !https.Agent) {
    https.Agent = function (options) {
      http.Agent.call(this, options)
    }
    util.inherits(https.Agent, http.Agent)
    https.Agent.prototype._getConnection = function(host, port, cb) {
      var s = tls.connect(port, host, this.options, function() {
        // do other checks here?
        if (cb) cb()
      })
      return s
    }
  }
  
  function isReadStream (rs) {
    if (rs.readable && rs.path && rs.mode) {
      return true
    }
  }
  
  function copy (obj) {
    var o = {}
    Object.keys(obj).forEach(function (i) {
      o[i] = obj[i]
    })
    return o
  }
  
  var isUrl = /^https?:/
  
  var globalPool = {}
  
  function Request (options) {
    stream.Stream.call(this)
    this.readable = true
    this.writable = true
  
    if (typeof options === 'string') {
      options = {uri:options}
    }
    
    var reserved = Object.keys(Request.prototype)
    for (var i in options) {
      if (reserved.indexOf(i) === -1) {
        this[i] = options[i]
      } else {
        if (typeof options[i] === 'function') {
          delete options[i]
        }
      }
    }
    options = copy(options)
    
    this.init(options)
  }
  util.inherits(Request, stream.Stream)
  Request.prototype.init = function (options) {
    var self = this
    
    if (!options) options = {}
    
    if (!self.pool) self.pool = globalPool
    self.dests = []
    self.__isRequestRequest = true
    
    // Protect against double callback
    if (!self._callback && self.callback) {
      self._callback = self.callback
      self.callback = function () {
        if (self._callbackCalled) return // Print a warning maybe?
        self._callback.apply(self, arguments)
        self._callbackCalled = true
      }
      self.on('error', self.callback.bind())
      self.on('complete', self.callback.bind(self, null))
    }
  
    if (self.url) {
      // People use this property instead all the time so why not just support it.
      self.uri = self.url
      delete self.url
    }
  
    if (!self.uri) {
      throw new Error("options.uri is a required argument")
    } else {
      if (typeof self.uri == "string") self.uri = url.parse(self.uri)
    }
    if (self.proxy) {
      if (typeof self.proxy == 'string') self.proxy = url.parse(self.proxy)
  
      // do the HTTP CONNECT dance using koichik/node-tunnel
      if (http.globalAgent && self.uri.protocol === "https:") {
        self.tunnel = true
        var tunnelFn = self.proxy.protocol === "http:"
                     ? tunnel.httpsOverHttp : tunnel.httpsOverHttps
  
        var tunnelOptions = { proxy: { host: self.proxy.hostname
                                     , port: +self.proxy.port 
                                     , proxyAuth: self.proxy.auth }
                            , ca: this.ca }
  
        self.agent = tunnelFn(tunnelOptions)
        self.tunnel = true
      }
    }
  
    self._redirectsFollowed = self._redirectsFollowed || 0
    self.maxRedirects = (self.maxRedirects !== undefined) ? self.maxRedirects : 10
    self.followRedirect = (self.followRedirect !== undefined) ? self.followRedirect : true
    self.followAllRedirects = (self.followAllRedirects !== undefined) ? self.followAllRedirects : false;
    if (self.followRedirect || self.followAllRedirects)
      self.redirects = self.redirects || []
  
    self.headers = self.headers ? copy(self.headers) : {}
  
    self.setHost = false
    if (!self.headers.host) {
      self.headers.host = self.uri.hostname
      if (self.uri.port) {
        if ( !(self.uri.port === 80 && self.uri.protocol === 'http:') &&
             !(self.uri.port === 443 && self.uri.protocol === 'https:') )
        self.headers.host += (':'+self.uri.port)
      }
      self.setHost = true
    }
    
    self.jar(self._jar || options.jar)
  
    if (!self.uri.pathname) {self.uri.pathname = '/'}
    if (!self.uri.port) {
      if (self.uri.protocol == 'http:') {self.uri.port = 80}
      else if (self.uri.protocol == 'https:') {self.uri.port = 443}
    }
  
    if (self.proxy && !self.tunnel) {
      self.port = self.proxy.port
      self.host = self.proxy.hostname
    } else {
      self.port = self.uri.port
      self.host = self.uri.hostname
    }
  
    self.clientErrorHandler = function (error) {
      if (self._aborted) return
      
      if (self.setHost) delete self.headers.host
      if (self.req._reusedSocket && error.code === 'ECONNRESET'
          && self.agent.addRequestNoreuse) {
        self.agent = { addRequest: self.agent.addRequestNoreuse.bind(self.agent) }
        self.start()
        self.req.end()
        return
      }
      if (self.timeout && self.timeoutTimer) {
        clearTimeout(self.timeoutTimer)
        self.timeoutTimer = null
      }
      self.emit('error', error)
    }
  
    if (options.form) {
      self.form(options.form)
    }
  
    if (options.oauth) {
      self.oauth(options.oauth)
    }
  
    if (self.uri.auth && !self.headers.authorization) {
      self.headers.authorization = "Basic " + toBase64(self.uri.auth.split(':').map(function(item){ return qs.unescape(item)}).join(':'))
    }
    if (self.proxy && self.proxy.auth && !self.headers['proxy-authorization'] && !self.tunnel) {
      self.headers['proxy-authorization'] = "Basic " + toBase64(self.proxy.auth.split(':').map(function(item){ return qs.unescape(item)}).join(':'))
    }
  
    if (options.qs) self.qs(options.qs)
  
    if (self.uri.path) {
      self.path = self.uri.path
    } else {
      self.path = self.uri.pathname + (self.uri.search || "")
    }
  
    if (self.path.length === 0) self.path = '/'
  
    if (self.proxy && !self.tunnel) self.path = (self.uri.protocol + '//' + self.uri.host + self.path)
  
    if (options.json) {
      self.json(options.json)
    } else if (options.multipart) {
      self.multipart(options.multipart)
    }
  
    if (self.body) {
      var length = 0
      if (!Buffer.isBuffer(self.body)) {
        if (Array.isArray(self.body)) {
          for (var i = 0; i < self.body.length; i++) {
            length += self.body[i].length
          }
        } else {
          self.body = new Buffer(self.body)
          length = self.body.length
        }
      } else {
        length = self.body.length
      }
      if (length) {
        self.headers['content-length'] = length
      } else {
        throw new Error('Argument error, options.body.')
      }
    }
  
    var protocol = self.proxy && !self.tunnel ? self.proxy.protocol : self.uri.protocol
      , defaultModules = {'http:':http, 'https:':https}
      , httpModules = self.httpModules || {}
      ;
    self.httpModule = httpModules[protocol] || defaultModules[protocol]
  
    if (!self.httpModule) throw new Error("Invalid protocol")
  
    if (options.ca) self.ca = options.ca
  
    if (!self.agent) {
      if (options.agentOptions) self.agentOptions = options.agentOptions
  
      if (options.agentClass) {
        self.agentClass = options.agentClass
      } else if (options.forever) {
        self.agentClass = protocol === 'http:' ? ForeverAgent : ForeverAgent.SSL
      } else {
        self.agentClass = self.httpModule.Agent
      }
    }
  
    if (self.pool === false) {
      self.agent = false
    } else {
      self.agent = self.agent || self.getAgent()
      if (self.maxSockets) {
        // Don't use our pooling if node has the refactored client
        self.agent.maxSockets = self.maxSockets
      }
      if (self.pool.maxSockets) {
        // Don't use our pooling if node has the refactored client
        self.agent.maxSockets = self.pool.maxSockets
      }
    }
  
    self.once('pipe', function (src) {
      if (self.ntick) throw new Error("You cannot pipe to this stream after the first nextTick() after creation of the request stream.")
      self.src = src
      if (isReadStream(src)) {
        if (!self.headers['content-type'] && !self.headers['Content-Type'])
          self.headers['content-type'] = mimetypes.lookup(src.path.slice(src.path.lastIndexOf('.')+1))
      } else {
        if (src.headers) {
          for (var i in src.headers) {
            if (!self.headers[i]) {
              self.headers[i] = src.headers[i]
            }
          }
        }
        if (src.method && !self.method) {
          self.method = src.method
        }
      }
  
      self.on('pipe', function () {
        console.error("You have already piped to this stream. Pipeing twice is likely to break the request.")
      })
    })
  
    process.nextTick(function () {
      if (self._aborted) return
      
      if (self.body) {
        if (Array.isArray(self.body)) {
          self.body.forEach(function(part) {
            self.write(part)
          })
        } else {
          self.write(self.body)
        }
        self.end()
      } else if (self.requestBodyStream) {
        console.warn("options.requestBodyStream is deprecated, please pass the request object to stream.pipe.")
        self.requestBodyStream.pipe(self)
      } else if (!self.src) {
        self.headers['content-length'] = 0
        self.end()
      }
      self.ntick = true
    })
  }
  
  Request.prototype.getAgent = function () {
    var Agent = this.agentClass
    var options = {}
    if (this.agentOptions) {
      for (var i in this.agentOptions) {
        options[i] = this.agentOptions[i]
      }
    }
    if (this.ca) options.ca = this.ca
  
    var poolKey = ''
  
    // different types of agents are in different pools
    if (Agent !== this.httpModule.Agent) {
      poolKey += Agent.name
    }
  
    if (!this.httpModule.globalAgent) {
      // node 0.4.x
      options.host = this.host
      options.port = this.port
      if (poolKey) poolKey += ':'
      poolKey += this.host + ':' + this.port
    }
  
    if (options.ca) {
      if (poolKey) poolKey += ':'
      poolKey += options.ca
    }
  
    if (!poolKey && Agent === this.httpModule.Agent && this.httpModule.globalAgent) {
      // not doing anything special.  Use the globalAgent
      return this.httpModule.globalAgent
    }
  
    // already generated an agent for this setting
    if (this.pool[poolKey]) return this.pool[poolKey]
  
    return this.pool[poolKey] = new Agent(options)
  }
  
  Request.prototype.start = function () {
    var self = this
    
    if (self._aborted) return
    
    self._started = true
    self.method = self.method || 'GET'
    self.href = self.uri.href
    if (log) log('%method %href', self)
    self.req = self.httpModule.request(self, function (response) {
      if (self._aborted) return
      if (self._paused) response.pause()
      
      self.response = response
      response.request = self
      response.toJSON = toJSON
  
      if (self.httpModule === https &&
          self.strictSSL &&
          !response.client.authorized) {
        var sslErr = response.client.authorizationError
        self.emit('error', new Error('SSL Error: '+ sslErr))
        return
      }
  
      if (self.setHost) delete self.headers.host
      if (self.timeout && self.timeoutTimer) {
        clearTimeout(self.timeoutTimer)
        self.timeoutTimer = null
      }  
      
      if (response.headers['set-cookie'] && (!self._disableCookies)) {
        response.headers['set-cookie'].forEach(function(cookie) {
          if (self._jar) self._jar.add(new Cookie(cookie))
          else cookieJar.add(new Cookie(cookie))
        })
      }
  
      if (response.statusCode >= 300 && response.statusCode < 400  &&
          (self.followAllRedirects ||
           (self.followRedirect && (self.method !== 'PUT' && self.method !== 'POST' && self.method !== 'DELETE'))) &&
          response.headers.location) {
        if (self._redirectsFollowed >= self.maxRedirects) {
          self.emit('error', new Error("Exceeded maxRedirects. Probably stuck in a redirect loop."))
          return
        }
        self._redirectsFollowed += 1
  
        if (!isUrl.test(response.headers.location)) {
          response.headers.location = url.resolve(self.uri.href, response.headers.location)
        }
        self.uri = response.headers.location
        self.redirects.push(
          { statusCode : response.statusCode
          , redirectUri: response.headers.location 
          }
        )
        if (self.followAllRedirects) self.method = 'GET'
        // self.method = 'GET'; // Force all redirects to use GET || commented out fixes #215
        delete self.req
        delete self.agent
        delete self._started
        delete self.body
        if (self.headers) {
          delete self.headers.host
        }
        if (log) log('Redirect to %uri', self)
        self.init()
        return // Ignore the rest of the response
      } else {
        self._redirectsFollowed = self._redirectsFollowed || 0
        // Be a good stream and emit end when the response is finished.
        // Hack to emit end on close because of a core bug that never fires end
        response.on('close', function () {
          if (!self._ended) self.response.emit('end')
        })
  
        if (self.encoding) {
          if (self.dests.length !== 0) {
            console.error("Ingoring encoding parameter as this stream is being piped to another stream which makes the encoding option invalid.")
          } else {
            response.setEncoding(self.encoding)
          }
        }
  
        self.dests.forEach(function (dest) {
          self.pipeDest(dest)
        })
  
        response.on("data", function (chunk) {
          self._destdata = true
          self.emit("data", chunk)
        })
        response.on("end", function (chunk) {
          self._ended = true
          self.emit("end", chunk)
        })
        response.on("close", function () {self.emit("close")})
  
        self.emit('response', response)
  
        if (self.callback) {
          var buffer = []
          var bodyLen = 0
          self.on("data", function (chunk) {
            buffer.push(chunk)
            bodyLen += chunk.length
          })
          self.on("end", function () {
            if (self._aborted) return
            
            if (buffer.length && Buffer.isBuffer(buffer[0])) {
              var body = new Buffer(bodyLen)
              var i = 0
              buffer.forEach(function (chunk) {
                chunk.copy(body, i, 0, chunk.length)
                i += chunk.length
              })
              if (self.encoding === null) {
                response.body = body
              } else {
                response.body = body.toString()
              }
            } else if (buffer.length) {
              response.body = buffer.join('')
            }
  
            if (self._json) {
              try {
                response.body = JSON.parse(response.body)
              } catch (e) {}
            }
            
            self.emit('complete', response, response.body)
          })
        }
      }
    })
  
    if (self.timeout && !self.timeoutTimer) {
      self.timeoutTimer = setTimeout(function() {
        self.req.abort()
        var e = new Error("ETIMEDOUT")
        e.code = "ETIMEDOUT"
        self.emit("error", e)
      }, self.timeout)
      
      // Set additional timeout on socket - in case if remote
      // server freeze after sending headers
      if (self.req.setTimeout) { // only works on node 0.6+
        self.req.setTimeout(self.timeout, function(){
          if (self.req) {
            self.req.abort()
            var e = new Error("ESOCKETTIMEDOUT")
            e.code = "ESOCKETTIMEDOUT"
            self.emit("error", e)
          }
        })
      }
    }
    
    self.req.on('error', self.clientErrorHandler)
    
    self.emit('request', self.req)
  }
  
  Request.prototype.abort = function() {
    this._aborted = true;
    
    if (this.req) {
      this.req.abort()
    }
    else if (this.response) {
      this.response.abort()
    }
    
    this.emit("abort")
  }
  
  Request.prototype.pipeDest = function (dest) {
    var response = this.response
    // Called after the response is received
    if (dest.headers) {
      dest.headers['content-type'] = response.headers['content-type']
      if (response.headers['content-length']) {
        dest.headers['content-length'] = response.headers['content-length']
      }
    }
    if (dest.setHeader) {
      for (var i in response.headers) {
        dest.setHeader(i, response.headers[i])
      }
      dest.statusCode = response.statusCode
    }
    if (this.pipefilter) this.pipefilter(response, dest)
  }
  
  // Composable API
  Request.prototype.setHeader = function (name, value, clobber) {
    if (clobber === undefined) clobber = true
    if (clobber || !this.headers.hasOwnProperty(name)) this.headers[name] = value
    else this.headers[name] += ',' + value
    return this
  }
  Request.prototype.setHeaders = function (headers) {
    for (i in headers) {this.setHeader(i, headers[i])}
    return this
  }
  Request.prototype.qs = function (q, clobber) {
    var base
    if (!clobber && this.uri.query) base = qs.parse(this.uri.query)
    else base = {}
    
    for (var i in q) {
      base[i] = q[i]
    }
    
    this.uri = url.parse(this.uri.href.split('?')[0] + '?' + qs.stringify(base))
    this.url = this.uri
    
    return this
  }
  Request.prototype.form = function (form) {
    this.headers['content-type'] = 'application/x-www-form-urlencoded; charset=utf-8'
    this.body = qs.stringify(form).toString('utf8')
    return this
  }
  Request.prototype.multipart = function (multipart) {
    var self = this
    self.body = []
  
    if (!self.headers['content-type']) {
      self.headers['content-type'] = 'multipart/related; boundary=frontier';
    } else {
      self.headers['content-type'] = self.headers['content-type'].split(';')[0] + '; boundary=frontier';
    }
  
    if (!multipart.forEach) throw new Error('Argument error, options.multipart.')
  
    multipart.forEach(function (part) {
      var body = part.body
      if(!body) throw Error('Body attribute missing in multipart.')
      delete part.body
      var preamble = '--frontier\r\n'
      Object.keys(part).forEach(function(key){
        preamble += key + ': ' + part[key] + '\r\n'
      })
      preamble += '\r\n'
      self.body.push(new Buffer(preamble))
      self.body.push(new Buffer(body))
      self.body.push(new Buffer('\r\n'))
    })
    self.body.push(new Buffer('--frontier--'))
    return self
  }
  Request.prototype.json = function (val) {
    this.setHeader('content-type', 'application/json')
    this.setHeader('accept', 'application/json')
    this._json = true
    if (typeof val === 'boolean') {
      if (typeof this.body === 'object') this.body = JSON.stringify(this.body)
    } else {
      this.body = JSON.stringify(val)
    }
    return this
  }
  Request.prototype.oauth = function (_oauth) {
    var form
    if (this.headers['content-type'] && 
        this.headers['content-type'].slice(0, 'application/x-www-form-urlencoded'.length) ===
          'application/x-www-form-urlencoded' 
       ) {
      form = qs.parse(this.body)
    }
    if (this.uri.query) {
      form = qs.parse(this.uri.query)
    } 
    if (!form) form = {}
    var oa = {}
    for (var i in form) oa[i] = form[i]
    for (var i in _oauth) oa['oauth_'+i] = _oauth[i]
    if (!oa.oauth_version) oa.oauth_version = '1.0'
    if (!oa.oauth_timestamp) oa.oauth_timestamp = Math.floor( (new Date()).getTime() / 1000 ).toString()
    if (!oa.oauth_nonce) oa.oauth_nonce = uuid().replace(/-/g, '')
    
    oa.oauth_signature_method = 'HMAC-SHA1'
    
    var consumer_secret = oa.oauth_consumer_secret
    delete oa.oauth_consumer_secret
    var token_secret = oa.oauth_token_secret
    delete oa.oauth_token_secret
    
    var baseurl = this.uri.protocol + '//' + this.uri.host + this.uri.pathname
    var signature = oauth.hmacsign(this.method, baseurl, oa, consumer_secret, token_secret)
    
    // oa.oauth_signature = signature
    for (var i in form) {
      if ( i.slice(0, 'oauth_') in _oauth) {
        // skip 
      } else {
        delete oa['oauth_'+i]
      }
    }
    this.headers.Authorization = 
      'OAuth '+Object.keys(oa).sort().map(function (i) {return i+'="'+oauth.rfc3986(oa[i])+'"'}).join(',')
    this.headers.Authorization += ',oauth_signature="'+oauth.rfc3986(signature)+'"'
    return this
  }
  Request.prototype.jar = function (jar) {
    var cookies
    
    if (this._redirectsFollowed === 0) {
      this.originalCookieHeader = this.headers.cookie
    }
    
    if (jar === false) {
      // disable cookies
      cookies = false;
      this._disableCookies = true;
    } else if (jar) {
      // fetch cookie from the user defined cookie jar
      cookies = jar.get({ url: this.uri.href })
    } else {
      // fetch cookie from the global cookie jar
      cookies = cookieJar.get({ url: this.uri.href })
    }
    
    if (cookies && cookies.length) {
      var cookieString = cookies.map(function (c) {
        return c.name + "=" + c.value
      }).join("; ")
  
      if (this.originalCookieHeader) {
        // Don't overwrite existing Cookie header
        this.headers.cookie = this.originalCookieHeader + '; ' + cookieString
      } else {
        this.headers.cookie = cookieString
      }
    }
    this._jar = jar
    return this
  }
  
  
  // Stream API
  Request.prototype.pipe = function (dest, opts) {
    if (this.response) {
      if (this._destdata) {
        throw new Error("You cannot pipe after data has been emitted from the response.")
      } else if (this._ended) {
        throw new Error("You cannot pipe after the response has been ended.")
      } else {
        stream.Stream.prototype.pipe.call(this, dest, opts)
        this.pipeDest(dest)
        return dest
      }
    } else {
      this.dests.push(dest)
      stream.Stream.prototype.pipe.call(this, dest, opts)
      return dest
    }
  }
  Request.prototype.write = function () {
    if (!this._started) this.start()
    this.req.write.apply(this.req, arguments)
  }
  Request.prototype.end = function (chunk) {
    if (chunk) this.write(chunk)
    if (!this._started) this.start()
    this.req.end()
  }
  Request.prototype.pause = function () {
    if (!this.response) this._paused = true
    else this.response.pause.apply(this.response, arguments)
  }
  Request.prototype.resume = function () {
    if (!this.response) this._paused = false
    else this.response.resume.apply(this.response, arguments)
  }
  Request.prototype.destroy = function () {
    if (!this._ended) this.end()
  }
  
  // organize params for post, put, head, del
  function initParams(uri, options, callback) {
    if ((typeof options === 'function') && !callback) callback = options;
    if (typeof options === 'object') {
      options.uri = uri;
    } else if (typeof uri === 'string') {
      options = {uri:uri};
    } else {
      options = uri;
      uri = options.uri;
    }
    return { uri: uri, options: options, callback: callback };
  }
  
  function request (uri, options, callback) {
    if (typeof uri === 'undefined') throw new Error('undefined is not a valid uri or options object.')
    if ((typeof options === 'function') && !callback) callback = options;
    if (typeof options === 'object') {
      options.uri = uri;
    } else if (typeof uri === 'string') {
      options = {uri:uri};
    } else {
      options = uri;
    }
  
    if (callback) options.callback = callback;
    var r = new Request(options)
    return r
  }
  
  module.exports = request
  
  request.defaults = function (options) {
    var def = function (method) {
      var d = function (uri, opts, callback) {
        var params = initParams(uri, opts, callback);
        for (var i in options) {
          if (params.options[i] === undefined) params.options[i] = options[i]
        }
        return method(params.options, params.callback)
      }
      return d
    }
    var de = def(request)
    de.get = def(request.get)
    de.post = def(request.post)
    de.put = def(request.put)
    de.head = def(request.head)
    de.del = def(request.del)
    de.cookie = def(request.cookie)
    de.jar = def(request.jar)
    return de
  }
  
  request.forever = function (agentOptions, optionsArg) {
    var options = {}
    if (optionsArg) {
      for (option in optionsArg) {
        options[option] = optionsArg[option]
      }
    }
    if (agentOptions) options.agentOptions = agentOptions
    options.forever = true
    return request.defaults(options)
  }
  
  request.get = request
  request.post = function (uri, options, callback) {
    var params = initParams(uri, options, callback);
    params.options.method = 'POST';
    return request(params.uri || null, params.options, params.callback)
  }
  request.put = function (uri, options, callback) {
    var params = initParams(uri, options, callback);
    params.options.method = 'PUT'
    return request(params.uri || null, params.options, params.callback)
  }
  request.head = function (uri, options, callback) {
    var params = initParams(uri, options, callback);
    params.options.method = 'HEAD'
    if (params.options.body || 
        params.options.requestBodyStream || 
        (params.options.json && typeof params.options.json !== 'boolean') || 
        params.options.multipart) {
      throw new Error("HTTP HEAD requests MUST NOT include a request body.")
    }
    return request(params.uri || null, params.options, params.callback)
  }
  request.del = function (uri, options, callback) {
    var params = initParams(uri, options, callback);
    params.options.method = 'DELETE'
    return request(params.uri || null, params.options, params.callback)
  }
  request.jar = function () {
    return new CookieJar
  }
  request.cookie = function (str) {
    if (str && str.uri) str = str.uri
    if (typeof str !== 'string') throw new Error("The cookie function only accepts STRING as param")
    return new Cookie(str)
  }
  
  // Safe toJSON
  
  function getSafe (self, uuid) {  
    if (typeof self === 'object' || typeof self === 'function') var safe = {}
    if (Array.isArray(self)) var safe = []
  
    var recurse = []
    
    Object.defineProperty(self, uuid, {})
    
    var attrs = Object.keys(self).filter(function (i) {
      if (i === uuid) return false 
      if ( (typeof self[i] !== 'object' && typeof self[i] !== 'function') || self[i] === null) return true
      return !(Object.getOwnPropertyDescriptor(self[i], uuid))
    })
    
    
    for (var i=0;i<attrs.length;i++) {
      if ( (typeof self[attrs[i]] !== 'object' && typeof self[attrs[i]] !== 'function') || 
            self[attrs[i]] === null
          ) {
        safe[attrs[i]] = self[attrs[i]]
      } else {
        recurse.push(attrs[i])
        Object.defineProperty(self[attrs[i]], uuid, {})
      }
    }
  
    for (var i=0;i<recurse.length;i++) {
      safe[recurse[i]] = getSafe(self[recurse[i]], uuid)
    }
    
    return safe
  }
  
  function toJSON () {
    return getSafe(this, (((1+Math.random())*0x10000)|0).toString(16))
  }
  
  Request.prototype.toJSON = toJSON
  
  

  provide("request", module.exports);

  $.ender(module.exports);

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  
  /**
   * Module dependencies.
   */
  
  var fs = require('fs')
    , path = require('path')
    , join = path.join
    , dirname = path.dirname
    , exists = fs.existsSync || path.existsSync
    , defaults = {
          arrow: ' -> '
        , compiled: 'compiled'
        , platform: process.platform
        , arch: process.arch
        , version: parseVersion(process.versions.node)
        , bindings: 'bindings.node'
        , try: [
            // node-waf and gyp_addon
            [ 'module_root', 'build', 'Debug', 'bindings' ]
          , [ 'module_root', 'build', 'Release', 'bindings' ]
            // Debug files, for development
          , [ 'module_root', 'out', 'Debug', 'bindings' ]   // Remove
          , [ 'module_root', 'Debug', 'bindings' ]          // Remove
            // Release files, but manually compiled
          , [ 'module_root', 'out', 'Release', 'bindings' ] // Remove
          , [ 'module_root', 'Release', 'bindings' ]        // Remove
            // Legacy from node-waf, node <= 0.4.x
          , [ 'module_root', 'build', 'default', 'bindings' ]
            // Production "Release" buildtype binary
          , [ 'module_root', 'compiled', 'version', 'platform', 'arch', 'bindings' ]
          ]
      }
  
  /**
   * The main `bindings()` function loads the compiled bindings for a given module.
   * It uses V8's Error API to determine the parent filename that this function is
   * being invoked from, which is then used to find the root directory.
   */
  
  function bindings (opts) {
  
    // Argument surgery
    if (typeof opts == 'string') {
      opts = { bindings: opts }
    } else if (!opts) {
      opts = {}
    }
    opts.__proto__ = defaults
  
    // Get the module root
    if (!opts.module_root) {
      opts.module_root = exports.getRoot(exports.getFileName())
    }
  
    // Ensure the given bindings name ends with .node
    if (path.extname(opts.bindings) != '.node') {
      opts.bindings += '.node'
    }
  
    var tries = []
      , i = 0
      , l = opts.try.length
      , n
  
    for (; i<l; i++) {
      n = join.apply(null, opts.try[i].map(function (p) {
        return opts[p] || p
      }))
      tries.push(n)
      try {
        var b = require(n)
        b.path = n
        return b
      } catch (e) {
        if (!/not find/i.test(e.message)) {
          throw e
        }
      }
    }
  
    var err = new Error('Could not load the bindings file. Tried:\n'
      + tries.map(function (a) { return opts.arrow + a }).join('\n'))
    err.tries = tries
    throw err
  }
  module.exports = exports = bindings
  
  
  /**
   * Gets the filename of the JavaScript file that invokes this function.
   * Used to help find the root directory of a module.
   */
  
  exports.getFileName = function getFileName () {
    var origPST = Error.prepareStackTrace
      , dummy = {}
      , fileName
  
    Error.prepareStackTrace = function (e, st) {
      for (var i=0, l=st.length; i<l; i++) {
        fileName = st[i].getFileName()
        if (fileName !== __filename) {
          return
        }
      }
    }
  
    // run the 'prepareStackTrace' function above
    Error.captureStackTrace(dummy)
    dummy.stack
  
    // cleanup
    Error.prepareStackTrace = origPST
  
    return fileName
  }
  
  /**
   * Gets the root directory of a module, given an arbitrary filename
   * somewhere in the module tree. The "root directory" is the directory
   * containing the `package.json` file.
   *
   *   In:  /home/nate/node-native-module/lib/index.js
   *   Out: /home/nate/node-native-module
   */
  
  exports.getRoot = function getRoot (file) {
    var dir = dirname(file)
      , prev
    while (true) {
      if (dir === '.') {
        // Avoids an infinite loop in rare cases, like the REPL
        dir = process.cwd()
      }
      if (exists(join(dir, 'package.json')) || exists(join(dir, 'node_modules'))) {
        // Found the 'package.json' file or 'node_modules' dir; we're done
        return dir
      }
      if (prev === dir) {
        // Got to the top
        throw new Error('Could not find module root given file: "' + file
                      + '". Do you have a `package.json` file? ')
      }
      // Try the parent dir next
      prev = dir
      dir = join(dir, '..')
    }
  }
  
  
  /**
   * Accepts a String like "v0.10.4" and returns a String
   * containing the major and minor versions ("0.10").
   */
  
  function parseVersion (str) {
    var m = String(str).match(/(\d+)\.(\d+)/)
    return m ? m[0] : null
  }
  exports.parseVersion = parseVersion
  

  provide("bindings", module.exports);

  $.ender(module.exports);

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  var ContextifyContext = require('bindings')('contextify').ContextifyContext;
  
  module.exports = function Contextify (sandbox) {
      if (typeof sandbox != 'object') {
          sandbox = {};
      }
      var ctx = new ContextifyContext(sandbox);
  
      sandbox.run = function () {
          return ctx.run.apply(ctx, arguments);
      };
  
      sandbox.getGlobal = function () {
          return ctx.getGlobal();
      }
  
      sandbox.dispose = function () {
          sandbox.run = function () {
              throw new Error("Called run() after dispose().");
          };
          sandbox.getGlobal = function () {
              throw new Error("Called getGlobal() after dispose().");
          };
          sandbox.dispose = function () {
              throw new Error("Called dispose() after dispose().");
          };
          ctx = null;
      }
      return sandbox;
  }
  

  provide("contextify", module.exports);

  $.ender(module.exports);

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  var dom      = exports.dom = require("./jsdom/level3/index").dom,
      features = require('./jsdom/browser/documentfeatures'),
      fs       = require("fs"),
      pkg      = JSON.parse(fs.readFileSync(__dirname + "/../package.json")),
      request  = require('request'),
      URL      = require('url');
  
  var style = require('./jsdom/level2/style');
  exports.defaultLevel = dom.level3.html;
  exports.browserAugmentation = require("./jsdom/browser/index").browserAugmentation;
  exports.windowAugmentation = require("./jsdom/browser/index").windowAugmentation;
  
  // Proxy feature functions to features module.
  ['availableDocumentFeatures',
   'defaultDocumentFeatures',
   'applyDocumentFeatures'].forEach(function (propName) {
    exports.__defineGetter__(propName, function () {
      return features[propName];
    });
    exports.__defineSetter__(propName, function (val) {
      return features[propName] = val;
    });
  });
  
  exports.debugMode = false;
  
  var createWindow = exports.createWindow = require("./jsdom/browser/index").createWindow;
  
  exports.__defineGetter__('version', function() {
    return pkg.version;
  });
  
  exports.level = function (level, feature) {
  	if(!feature) feature = 'core'
  	return require('./jsdom/level' + level + '/' + feature).dom['level' + level][feature]
  }
  
  exports.jsdom = function (html, level, options) {
  
    options = options || {};
    if(typeof level == "string") {
      level = exports.level(level, 'html')
    } else {
      level   = level || exports.defaultLevel;
    }
  
    if (!options.url) {
      options.url = (module.parent.id === 'jsdom') ?
                    module.parent.parent.filename  :
                    module.parent.filename;
    }
  
    var browser = exports.browserAugmentation(level, options),
        doc     = (browser.HTMLDocument)             ?
                   new browser.HTMLDocument(options) :
                   new browser.Document(options);
  
    if (options.features && options.features.QuerySelector) {
      require("./jsdom/selectors/index").applyQuerySelector(doc, level);
    }
  
    features.applyDocumentFeatures(doc, options.features);
  
    if (typeof html === 'undefined' || html === null) {
      doc.write('<html><head></head><body></body></html>');
    } else {
      doc.write(html + '');
    }
  
    if (doc.close && !options.deferClose) {
      doc.close();
    }
  
    // Kept for backwards-compatibility. The window is lazily created when
    // document.parentWindow or document.defaultView is accessed.
    doc.createWindow = function() {
      // Remove ourself
      if (doc.createWindow) {
        delete doc.createWindow;
      }
      return doc.parentWindow;
    };
  
    return doc;
  };
  
  exports.html = function(html, level, options) {
    html += '';
  
    // TODO: cache a regex and use it here instead
    //       or make the parser handle it
    var htmlLowered = html.toLowerCase();
  
    // body
    if (!~htmlLowered.indexOf('<body')) {
      html = '<body>' + html + '</body>';
    }
  
    // html
    if (!~htmlLowered.indexOf('<html')) {
      html = '<html>' + html + '</html>';
    }
    return exports.jsdom(html, level, options);
  };
  
  exports.jQueryify = exports.jsdom.jQueryify = function (window /* path [optional], callback */) {
  
    if (!window || !window.document) { return; }
  
    var args = Array.prototype.slice.call(arguments),
        callback = (typeof(args[args.length - 1]) === 'function') && args.pop(),
        path,
        jQueryTag = window.document.createElement("script");
        jQueryTag.className = "jsdom";
  
    if (args.length > 1 && typeof(args[1] === 'string')) {
      path = args[1];
    }
  
    var features = window.document.implementation._features;
  
    window.document.implementation.addFeature('FetchExternalResources', ['script']);
    window.document.implementation.addFeature('ProcessExternalResources', ['script']);
    window.document.implementation.addFeature('MutationEvents', ["1.0"]);
    jQueryTag.src = path || 'http://code.jquery.com/jquery-latest.js';
    window.document.body.appendChild(jQueryTag);
  
    jQueryTag.onload = function() {
      if (callback) {
        callback(window, window.jQuery);
      }
  
      window.document.implementation._features = features;
    };
  
    return window;
  };
  
  
  exports.env = exports.jsdom.env = function() {
    var
    args        = Array.prototype.slice.call(arguments),
    config      = exports.env.processArguments(args),
    callback    = config.done,
    processHTML = function(err, html) {
  
      html += '';
      if(err) {
        return callback(err);
      }
  
      config.scripts = config.scripts || [];
      if (typeof config.scripts === 'string') {
        config.scripts = [config.scripts];
      }
  
      config.src = config.src || [];
      if (typeof config.src === 'string') {
        config.src = [config.src];
      }
  
      var
      options    = {
        features: config.features || {
          'FetchExternalResources' : false,
          'ProcessExternalResources' : false
        },
        url: config.url
      },
      window     = exports.html(html, null, options).createWindow(),
      features   = JSON.parse(JSON.stringify(window.document.implementation._features)),
      docsLoaded = 0,
      totalDocs  = config.scripts.length + config.src.length,
      readyState = null,
      errors     = null;
  
      if (!window || !window.document) {
        return callback(new Error('JSDOM: a window object could not be created.'));
      }
  
      if( config.document ) {
        window.document._referrer = config.document.referrer;
        window.document._cookie = config.document.cookie;
      }
  
      window.document.implementation.addFeature('FetchExternalResources', ['script']);
      window.document.implementation.addFeature('ProcessExternalResources', ['script']);
      window.document.implementation.addFeature('MutationEvents', ['1.0']);
  
      var scriptComplete = function() {
        docsLoaded++;
        if (docsLoaded >= totalDocs) {
          window.document.implementation._features = features;
  
          if (errors) {
            errors = errors.concat(window.document.errors || []);
          }
  
          process.nextTick(function() { callback(errors, window); });
        }
      }
  
      if (config.scripts.length > 0 || config.src.length > 0) {
        config.scripts.forEach(function(src) {
          var script = window.document.createElement('script');
          script.className = "jsdom";
          script.onload = function() {
            scriptComplete()
          };
  
          script.onerror = function(e) {
            if (!errors) {
              errors = [];
            }
            errors.push(e.error);
            scriptComplete();
          };
  
          script.src = src;
          try {
            // project against invalid dom
            // ex: http://www.google.com/foo#bar
            window.document.documentElement.appendChild(script);
          } catch(e) {
            if(!errors) {
              errors=[];
            }
            errors.push(e.error || e.message);
            scriptComplete();
          }
        });
  
        config.src.forEach(function(src) {
          var script = window.document.createElement('script');
          script.onload = function() {
            process.nextTick(scriptComplete);
          };
  
          script.onerror = function(e) {
            if (!errors) {
              errors = [];
            }
            errors.push(e.error || e.message);
            // nextTick so that an exception within scriptComplete won't cause
            // another script onerror (which would be an infinite loop)
            process.nextTick(scriptComplete);
          };
  
          script.text = src;
          window.document.documentElement.appendChild(script);
          window.document.documentElement.removeChild(script);
        });
      } else {
        scriptComplete();
      }
    };
  
    config.html += '';
  
    // Handle markup
    if (config.html.indexOf("\n") > 0 || config.html.match(/^\W*</)) {
      processHTML(null, config.html);
  
    // Handle url/file
    } else {
      var url = URL.parse(config.html);
      config.url = config.url || url.href;
      if (url.hostname) {
        request({
          uri      : url,
          encoding : config.encoding || 'utf8',
          headers  : config.headers || {}
        },
        function(err, request, body) {
          processHTML(err, body);
        });
      } else {
        fs.readFile(config.html, processHTML);
      }
    }
  };
  
  /*
    Since jsdom.env() is a helper for quickly and easily setting up a
    window with scripts and such already loaded into it, the arguments
    should be fairly flexible.  Here are the requirements
  
    1) collect `html` (url, string, or file on disk)  (STRING)
    2) load `code` into the window (array of scripts) (ARRAY)
    3) callback when resources are `done`             (FUNCTION)
    4) configuration                                  (OBJECT)
  
    Rules:
    + if there is one argument it had better be an object with atleast
      a `html` and `done` property (other properties are gravy)
  
    + arguments above are pulled out of the arguments and put into the
      config object that is returned
  */
  exports.env.processArguments = function(args) {
    if (!args || !args.length || args.length < 1) {
      throw new Error('No arguments passed to jsdom.env().');
    }
  
    var
    props = {
      'html'    : true,
      'done'    : true,
      'scripts' : false,
      'config'  : false,
      'url'     : false,  // the URL for location.href if different from html
      'document': false   // HTMLDocument properties
    },
    propKeys = Object.keys(props),
    config = {
      code : []
    },
    l    = args.length
    ;
    if (l === 1) {
      config = args[0];
    } else {
      args.forEach(function(v) {
        var type = typeof v;
        if (!v) {
          return;
        }
        if (type === 'string' || v + '' === v) {
          config.html = v;
        } else if (type === 'object') {
          // Array
          if (v.length && v[0]) {
            config.scripts = v;
          } else {
            // apply missing required properties if appropriate
            propKeys.forEach(function(req) {
  
              if (typeof v[req] !== 'undefined' &&
                  typeof config[req] === 'undefined') {
  
                config[req] = v[req];
                delete v[req];
              }
            });
            config.config = v;
          }
        } else if (type === 'function') {
          config.done = v;
        }
      });
    }
  
    propKeys.forEach(function(req) {
      var required = props[req];
      if (required && typeof config[req] === 'undefined') {
        throw new Error("jsdom.env requires a '" + req + "' argument");
      }
    });
    return config;
  };
  

  provide("jsdom", module.exports);

  $.ender(module.exports);

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  var self = this,
      globals = ["document", "window", "navigator", "CSSStyleDeclaration", "d3", "Sizzle"],
      globalValues = {};
  
  globals.forEach(function(global) {
    if (global in self) globalValues[global] = self[global];
  });
  
  document = require("jsdom").jsdom("<html><head></head><body></body></html>");
  window = document.createWindow();
  navigator = window.navigator;
  CSSStyleDeclaration = window.CSSStyleDeclaration;
  
  Sizzle = require("sizzle");
  
  require("./d3.v2");
  
  module.exports = d3;
  
  globals.forEach(function(global) {
    if (global in globalValues) self[global] = globalValues[global];
    else delete self[global];
  });
  

  provide("d3", module.exports);

  $.ender(module.exports);

}());