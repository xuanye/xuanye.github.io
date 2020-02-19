/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!*********************************!*\
  !*** ./source/sample07/app.tsx ***!
  \*********************************/
/***/ function(module, exports, __webpack_require__) {

	/// <reference path='../../typings/browser.d.ts'/>
	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var React = __webpack_require__(/*! react */ 1);
	var ReactDOM = __webpack_require__(/*! react-dom */ 2);
	var redux_1 = __webpack_require__(/*! redux */ 6);
	var react_redux_1 = __webpack_require__(/*! react-redux */ 17);
	var counter_1 = __webpack_require__(/*! ./counter */ 27);
	var actionplayer_1 = __webpack_require__(/*! ./actionplayer */ 28);
	var shapemaker_1 = __webpack_require__(/*! ./shapemaker */ 29);
	var shapeviewer_1 = __webpack_require__(/*! ./shapeviewer */ 31);
	var colorpicker_1 = __webpack_require__(/*! ./colorpicker */ 30);
	__webpack_require__(/*! ./objectassign */ 32);
	var actions = [];
	var defaultState = { nextShapeId: 0, width: 100, height: 100, color: "#000000", shapes: [] };
	var store = redux_1.createStore(function (state, action) {
	    actions.push(action);
	    var shape;
	    switch (action.type) {
	        case "COUNTER_CHANGE":
	            return Object.assign({}, state, (_a = {}, _a[action.field] = state[action.field] + action.by, _a));
	        case "COLOR_CHANGE":
	            return Object.assign({}, state, { color: action.color });
	        case "SHAPE_ADD":
	            var id = state.nextShapeId;
	            shape = Object.assign({}, { id: id }, action);
	            delete shape["type"];
	            return Object.assign({}, state, { nextShapeId: id + 1, shapes: state.shapes.concat([shape]) });
	        case "SHAPE_CHANGE":
	            shape = Object.assign({}, state.shapes.filter(function (x) { return x.id === action.id; })[0], { top: action.top, left: action.left });
	            return Object.assign({}, state, { shapes: state.shapes.filter(function (x) { return x.id !== action.id; }).concat([shape]) });
	        case "LOAD":
	            return action.state;
	        default:
	            return state;
	    }
	    var _a;
	}, defaultState);
	var ColorWrapperBase = (function (_super) {
	    __extends(ColorWrapperBase, _super);
	    function ColorWrapperBase() {
	        _super.apply(this, arguments);
	    }
	    ColorWrapperBase.prototype.render = function () {
	        return React.createElement(colorpicker_1.ColorPicker, {color: this.props.color, onChange: this.props.setColor});
	    };
	    return ColorWrapperBase;
	}(React.Component));
	var ColorWrapper = react_redux_1.connect(function (state) { return ({ color: state.color }); }, function (dispatch) { return ({ setColor: function (color) { return dispatch({ type: 'COLOR_CHANGE', color: color }); } }); })(ColorWrapperBase);
	ReactDOM.render(React.createElement(react_redux_1.Provider, {store: store}, React.createElement("table", null, React.createElement("tbody", null, React.createElement("tr", null, React.createElement("td", {style: { width: 220 }}, React.createElement(counter_1.default, {field: "width", step: 10}), React.createElement(counter_1.default, {field: "height", step: 10}), React.createElement(ColorWrapper, null)), React.createElement("td", {style: { verticalAlign: "top", textAlign: "center", width: 500 }}, React.createElement("h2", null, "Preview"), React.createElement(shapemaker_1.default, null)), React.createElement("td", {style: { verticalAlign: 'bottom' }}, React.createElement(actionplayer_1.default, {store: store, actions: actions, defaultState: defaultState}))), React.createElement("tr", null, React.createElement("td", {colSpan: 3}, React.createElement("h2", {style: { margin: 5, textAlign: 'center' }}, "Shapes"), React.createElement(shapeviewer_1.default, null)))))), document.getElementById("content"));


/***/ },
/* 1 */
/*!************************!*\
  !*** external "React" ***!
  \************************/
/***/ function(module, exports) {

	module.exports = React;

/***/ },
/* 2 */
/*!***************************!*\
  !*** external "ReactDOM" ***!
  \***************************/
/***/ function(module, exports) {

	module.exports = ReactDOM;

/***/ },
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */
/*!******************************!*\
  !*** ./~/redux/lib/index.js ***!
  \******************************/
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	exports.__esModule = true;
	exports.compose = exports.applyMiddleware = exports.bindActionCreators = exports.combineReducers = exports.createStore = undefined;
	
	var _createStore = __webpack_require__(/*! ./createStore */ 8);
	
	var _createStore2 = _interopRequireDefault(_createStore);
	
	var _combineReducers = __webpack_require__(/*! ./combineReducers */ 12);
	
	var _combineReducers2 = _interopRequireDefault(_combineReducers);
	
	var _bindActionCreators = __webpack_require__(/*! ./bindActionCreators */ 14);
	
	var _bindActionCreators2 = _interopRequireDefault(_bindActionCreators);
	
	var _applyMiddleware = __webpack_require__(/*! ./applyMiddleware */ 15);
	
	var _applyMiddleware2 = _interopRequireDefault(_applyMiddleware);
	
	var _compose = __webpack_require__(/*! ./compose */ 16);
	
	var _compose2 = _interopRequireDefault(_compose);
	
	var _warning = __webpack_require__(/*! ./utils/warning */ 13);
	
	var _warning2 = _interopRequireDefault(_warning);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	/*
	* This is a dummy function to check if the function name has been altered by minification.
	* If the function has been minified and NODE_ENV !== 'production', warn the user.
	*/
	function isCrushed() {}
	
	if (process.env.NODE_ENV !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
	  (0, _warning2["default"])('You are currently using minified code outside of NODE_ENV === \'production\'. ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 'to ensure you have the correct code for your production build.');
	}
	
	exports.createStore = _createStore2["default"];
	exports.combineReducers = _combineReducers2["default"];
	exports.bindActionCreators = _bindActionCreators2["default"];
	exports.applyMiddleware = _applyMiddleware2["default"];
	exports.compose = _compose2["default"];
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! (webpack)/~/process/browser.js */ 7)))

/***/ },
/* 7 */
/*!**************************************!*\
  !*** (webpack)/~/process/browser.js ***!
  \**************************************/
/***/ function(module, exports) {

	// shim for using process in browser
	
	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 8 */
/*!************************************!*\
  !*** ./~/redux/lib/createStore.js ***!
  \************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.ActionTypes = undefined;
	exports["default"] = createStore;
	
	var _isPlainObject = __webpack_require__(/*! lodash/isPlainObject */ 9);
	
	var _isPlainObject2 = _interopRequireDefault(_isPlainObject);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	/**
	 * These are private action types reserved by Redux.
	 * For any unknown actions, you must return the current state.
	 * If the current state is undefined, you must return the initial state.
	 * Do not reference these action types directly in your code.
	 */
	var ActionTypes = exports.ActionTypes = {
	  INIT: '@@redux/INIT'
	};
	
	/**
	 * Creates a Redux store that holds the state tree.
	 * The only way to change the data in the store is to call `dispatch()` on it.
	 *
	 * There should only be a single store in your app. To specify how different
	 * parts of the state tree respond to actions, you may combine several reducers
	 * into a single reducer function by using `combineReducers`.
	 *
	 * @param {Function} reducer A function that returns the next state tree, given
	 * the current state tree and the action to handle.
	 *
	 * @param {any} [initialState] The initial state. You may optionally specify it
	 * to hydrate the state from the server in universal apps, or to restore a
	 * previously serialized user session.
	 * If you use `combineReducers` to produce the root reducer function, this must be
	 * an object with the same shape as `combineReducers` keys.
	 *
	 * @param {Function} enhancer The store enhancer. You may optionally specify it
	 * to enhance the store with third-party capabilities such as middleware,
	 * time travel, persistence, etc. The only store enhancer that ships with Redux
	 * is `applyMiddleware()`.
	 *
	 * @returns {Store} A Redux store that lets you read the state, dispatch actions
	 * and subscribe to changes.
	 */
	function createStore(reducer, initialState, enhancer) {
	  if (typeof initialState === 'function' && typeof enhancer === 'undefined') {
	    enhancer = initialState;
	    initialState = undefined;
	  }
	
	  if (typeof enhancer !== 'undefined') {
	    if (typeof enhancer !== 'function') {
	      throw new Error('Expected the enhancer to be a function.');
	    }
	
	    return enhancer(createStore)(reducer, initialState);
	  }
	
	  if (typeof reducer !== 'function') {
	    throw new Error('Expected the reducer to be a function.');
	  }
	
	  var currentReducer = reducer;
	  var currentState = initialState;
	  var currentListeners = [];
	  var nextListeners = currentListeners;
	  var isDispatching = false;
	
	  function ensureCanMutateNextListeners() {
	    if (nextListeners === currentListeners) {
	      nextListeners = currentListeners.slice();
	    }
	  }
	
	  /**
	   * Reads the state tree managed by the store.
	   *
	   * @returns {any} The current state tree of your application.
	   */
	  function getState() {
	    return currentState;
	  }
	
	  /**
	   * Adds a change listener. It will be called any time an action is dispatched,
	   * and some part of the state tree may potentially have changed. You may then
	   * call `getState()` to read the current state tree inside the callback.
	   *
	   * You may call `dispatch()` from a change listener, with the following
	   * caveats:
	   *
	   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
	   * If you subscribe or unsubscribe while the listeners are being invoked, this
	   * will not have any effect on the `dispatch()` that is currently in progress.
	   * However, the next `dispatch()` call, whether nested or not, will use a more
	   * recent snapshot of the subscription list.
	   *
	   * 2. The listener should not expect to see all states changes, as the state
	   * might have been updated multiple times during a nested `dispatch()` before
	   * the listener is called. It is, however, guaranteed that all subscribers
	   * registered before the `dispatch()` started will be called with the latest
	   * state by the time it exits.
	   *
	   * @param {Function} listener A callback to be invoked on every dispatch.
	   * @returns {Function} A function to remove this change listener.
	   */
	  function subscribe(listener) {
	    if (typeof listener !== 'function') {
	      throw new Error('Expected listener to be a function.');
	    }
	
	    var isSubscribed = true;
	
	    ensureCanMutateNextListeners();
	    nextListeners.push(listener);
	
	    return function unsubscribe() {
	      if (!isSubscribed) {
	        return;
	      }
	
	      isSubscribed = false;
	
	      ensureCanMutateNextListeners();
	      var index = nextListeners.indexOf(listener);
	      nextListeners.splice(index, 1);
	    };
	  }
	
	  /**
	   * Dispatches an action. It is the only way to trigger a state change.
	   *
	   * The `reducer` function, used to create the store, will be called with the
	   * current state tree and the given `action`. Its return value will
	   * be considered the **next** state of the tree, and the change listeners
	   * will be notified.
	   *
	   * The base implementation only supports plain object actions. If you want to
	   * dispatch a Promise, an Observable, a thunk, or something else, you need to
	   * wrap your store creating function into the corresponding middleware. For
	   * example, see the documentation for the `redux-thunk` package. Even the
	   * middleware will eventually dispatch plain object actions using this method.
	   *
	   * @param {Object} action A plain object representing “what changed”. It is
	   * a good idea to keep actions serializable so you can record and replay user
	   * sessions, or use the time travelling `redux-devtools`. An action must have
	   * a `type` property which may not be `undefined`. It is a good idea to use
	   * string constants for action types.
	   *
	   * @returns {Object} For convenience, the same action object you dispatched.
	   *
	   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
	   * return something else (for example, a Promise you can await).
	   */
	  function dispatch(action) {
	    if (!(0, _isPlainObject2["default"])(action)) {
	      throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
	    }
	
	    if (typeof action.type === 'undefined') {
	      throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
	    }
	
	    if (isDispatching) {
	      throw new Error('Reducers may not dispatch actions.');
	    }
	
	    try {
	      isDispatching = true;
	      currentState = currentReducer(currentState, action);
	    } finally {
	      isDispatching = false;
	    }
	
	    var listeners = currentListeners = nextListeners;
	    for (var i = 0; i < listeners.length; i++) {
	      listeners[i]();
	    }
	
	    return action;
	  }
	
	  /**
	   * Replaces the reducer currently used by the store to calculate the state.
	   *
	   * You might need this if your app implements code splitting and you want to
	   * load some of the reducers dynamically. You might also need this if you
	   * implement a hot reloading mechanism for Redux.
	   *
	   * @param {Function} nextReducer The reducer for the store to use instead.
	   * @returns {void}
	   */
	  function replaceReducer(nextReducer) {
	    if (typeof nextReducer !== 'function') {
	      throw new Error('Expected the nextReducer to be a function.');
	    }
	
	    currentReducer = nextReducer;
	    dispatch({ type: ActionTypes.INIT });
	  }
	
	  // When a store is created, an "INIT" action is dispatched so that every
	  // reducer returns their initial state. This effectively populates
	  // the initial state tree.
	  dispatch({ type: ActionTypes.INIT });
	
	  return {
	    dispatch: dispatch,
	    subscribe: subscribe,
	    getState: getState,
	    replaceReducer: replaceReducer
	  };
	}

/***/ },
/* 9 */
/*!***********************************!*\
  !*** ./~/lodash/isPlainObject.js ***!
  \***********************************/
/***/ function(module, exports, __webpack_require__) {

	var isHostObject = __webpack_require__(/*! ./_isHostObject */ 10),
	    isObjectLike = __webpack_require__(/*! ./isObjectLike */ 11);
	
	/** `Object#toString` result references. */
	var objectTag = '[object Object]';
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to resolve the decompiled source of functions. */
	var funcToString = Function.prototype.toString;
	
	/** Used to infer the `Object` constructor. */
	var objectCtorString = funcToString.call(Object);
	
	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;
	
	/** Built-in value references. */
	var getPrototypeOf = Object.getPrototypeOf;
	
	/**
	 * Checks if `value` is a plain object, that is, an object created by the
	 * `Object` constructor or one with a `[[Prototype]]` of `null`.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 * }
	 *
	 * _.isPlainObject(new Foo);
	 * // => false
	 *
	 * _.isPlainObject([1, 2, 3]);
	 * // => false
	 *
	 * _.isPlainObject({ 'x': 0, 'y': 0 });
	 * // => true
	 *
	 * _.isPlainObject(Object.create(null));
	 * // => true
	 */
	function isPlainObject(value) {
	  if (!isObjectLike(value) ||
	      objectToString.call(value) != objectTag || isHostObject(value)) {
	    return false;
	  }
	  var proto = getPrototypeOf(value);
	  if (proto === null) {
	    return true;
	  }
	  var Ctor = proto.constructor;
	  return (typeof Ctor == 'function' &&
	    Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString);
	}
	
	module.exports = isPlainObject;


/***/ },
/* 10 */
/*!***********************************!*\
  !*** ./~/lodash/_isHostObject.js ***!
  \***********************************/
/***/ function(module, exports) {

	/**
	 * Checks if `value` is a host object in IE < 9.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
	 */
	function isHostObject(value) {
	  // Many host objects are `Object` objects that can coerce to strings
	  // despite having improperly defined `toString` methods.
	  var result = false;
	  if (value != null && typeof value.toString != 'function') {
	    try {
	      result = !!(value + '');
	    } catch (e) {}
	  }
	  return result;
	}
	
	module.exports = isHostObject;


/***/ },
/* 11 */
/*!**********************************!*\
  !*** ./~/lodash/isObjectLike.js ***!
  \**********************************/
/***/ function(module, exports) {

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}
	
	module.exports = isObjectLike;


/***/ },
/* 12 */
/*!****************************************!*\
  !*** ./~/redux/lib/combineReducers.js ***!
  \****************************************/
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	exports.__esModule = true;
	exports["default"] = combineReducers;
	
	var _createStore = __webpack_require__(/*! ./createStore */ 8);
	
	var _isPlainObject = __webpack_require__(/*! lodash/isPlainObject */ 9);
	
	var _isPlainObject2 = _interopRequireDefault(_isPlainObject);
	
	var _warning = __webpack_require__(/*! ./utils/warning */ 13);
	
	var _warning2 = _interopRequireDefault(_warning);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	function getUndefinedStateErrorMessage(key, action) {
	  var actionType = action && action.type;
	  var actionName = actionType && '"' + actionType.toString() + '"' || 'an action';
	
	  return 'Reducer "' + key + '" returned undefined handling ' + actionName + '. ' + 'To ignore an action, you must explicitly return the previous state.';
	}
	
	function getUnexpectedStateShapeWarningMessage(inputState, reducers, action) {
	  var reducerKeys = Object.keys(reducers);
	  var argumentName = action && action.type === _createStore.ActionTypes.INIT ? 'initialState argument passed to createStore' : 'previous state received by the reducer';
	
	  if (reducerKeys.length === 0) {
	    return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
	  }
	
	  if (!(0, _isPlainObject2["default"])(inputState)) {
	    return 'The ' + argumentName + ' has unexpected type of "' + {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] + '". Expected argument to be an object with the following ' + ('keys: "' + reducerKeys.join('", "') + '"');
	  }
	
	  var unexpectedKeys = Object.keys(inputState).filter(function (key) {
	    return !reducers.hasOwnProperty(key);
	  });
	
	  if (unexpectedKeys.length > 0) {
	    return 'Unexpected ' + (unexpectedKeys.length > 1 ? 'keys' : 'key') + ' ' + ('"' + unexpectedKeys.join('", "') + '" found in ' + argumentName + '. ') + 'Expected to find one of the known reducer keys instead: ' + ('"' + reducerKeys.join('", "') + '". Unexpected keys will be ignored.');
	  }
	}
	
	function assertReducerSanity(reducers) {
	  Object.keys(reducers).forEach(function (key) {
	    var reducer = reducers[key];
	    var initialState = reducer(undefined, { type: _createStore.ActionTypes.INIT });
	
	    if (typeof initialState === 'undefined') {
	      throw new Error('Reducer "' + key + '" returned undefined during initialization. ' + 'If the state passed to the reducer is undefined, you must ' + 'explicitly return the initial state. The initial state may ' + 'not be undefined.');
	    }
	
	    var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.');
	    if (typeof reducer(undefined, { type: type }) === 'undefined') {
	      throw new Error('Reducer "' + key + '" returned undefined when probed with a random type. ' + ('Don\'t try to handle ' + _createStore.ActionTypes.INIT + ' or other actions in "redux/*" ') + 'namespace. They are considered private. Instead, you must return the ' + 'current state for any unknown actions, unless it is undefined, ' + 'in which case you must return the initial state, regardless of the ' + 'action type. The initial state may not be undefined.');
	    }
	  });
	}
	
	/**
	 * Turns an object whose values are different reducer functions, into a single
	 * reducer function. It will call every child reducer, and gather their results
	 * into a single state object, whose keys correspond to the keys of the passed
	 * reducer functions.
	 *
	 * @param {Object} reducers An object whose values correspond to different
	 * reducer functions that need to be combined into one. One handy way to obtain
	 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
	 * undefined for any action. Instead, they should return their initial state
	 * if the state passed to them was undefined, and the current state for any
	 * unrecognized action.
	 *
	 * @returns {Function} A reducer function that invokes every reducer inside the
	 * passed object, and builds a state object with the same shape.
	 */
	function combineReducers(reducers) {
	  var reducerKeys = Object.keys(reducers);
	  var finalReducers = {};
	  for (var i = 0; i < reducerKeys.length; i++) {
	    var key = reducerKeys[i];
	    if (typeof reducers[key] === 'function') {
	      finalReducers[key] = reducers[key];
	    }
	  }
	  var finalReducerKeys = Object.keys(finalReducers);
	
	  var sanityError;
	  try {
	    assertReducerSanity(finalReducers);
	  } catch (e) {
	    sanityError = e;
	  }
	
	  return function combination() {
	    var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	    var action = arguments[1];
	
	    if (sanityError) {
	      throw sanityError;
	    }
	
	    if (process.env.NODE_ENV !== 'production') {
	      var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action);
	      if (warningMessage) {
	        (0, _warning2["default"])(warningMessage);
	      }
	    }
	
	    var hasChanged = false;
	    var nextState = {};
	    for (var i = 0; i < finalReducerKeys.length; i++) {
	      var key = finalReducerKeys[i];
	      var reducer = finalReducers[key];
	      var previousStateForKey = state[key];
	      var nextStateForKey = reducer(previousStateForKey, action);
	      if (typeof nextStateForKey === 'undefined') {
	        var errorMessage = getUndefinedStateErrorMessage(key, action);
	        throw new Error(errorMessage);
	      }
	      nextState[key] = nextStateForKey;
	      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
	    }
	    return hasChanged ? nextState : state;
	  };
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! (webpack)/~/process/browser.js */ 7)))

/***/ },
/* 13 */
/*!**************************************!*\
  !*** ./~/redux/lib/utils/warning.js ***!
  \**************************************/
/***/ function(module, exports) {

	'use strict';
	
	exports.__esModule = true;
	exports["default"] = warning;
	/**
	 * Prints a warning in the console if it exists.
	 *
	 * @param {String} message The warning message.
	 * @returns {void}
	 */
	function warning(message) {
	  /* eslint-disable no-console */
	  if (typeof console !== 'undefined' && typeof console.error === 'function') {
	    console.error(message);
	  }
	  /* eslint-enable no-console */
	  try {
	    // This error was thrown as a convenience so that you can use this stack
	    // to find the callsite that caused this warning to fire.
	    throw new Error(message);
	    /* eslint-disable no-empty */
	  } catch (e) {}
	  /* eslint-enable no-empty */
	}

/***/ },
/* 14 */
/*!*******************************************!*\
  !*** ./~/redux/lib/bindActionCreators.js ***!
  \*******************************************/
/***/ function(module, exports) {

	'use strict';
	
	exports.__esModule = true;
	exports["default"] = bindActionCreators;
	function bindActionCreator(actionCreator, dispatch) {
	  return function () {
	    return dispatch(actionCreator.apply(undefined, arguments));
	  };
	}
	
	/**
	 * Turns an object whose values are action creators, into an object with the
	 * same keys, but with every function wrapped into a `dispatch` call so they
	 * may be invoked directly. This is just a convenience method, as you can call
	 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
	 *
	 * For convenience, you can also pass a single function as the first argument,
	 * and get a function in return.
	 *
	 * @param {Function|Object} actionCreators An object whose values are action
	 * creator functions. One handy way to obtain it is to use ES6 `import * as`
	 * syntax. You may also pass a single function.
	 *
	 * @param {Function} dispatch The `dispatch` function available on your Redux
	 * store.
	 *
	 * @returns {Function|Object} The object mimicking the original object, but with
	 * every action creator wrapped into the `dispatch` call. If you passed a
	 * function as `actionCreators`, the return value will also be a single
	 * function.
	 */
	function bindActionCreators(actionCreators, dispatch) {
	  if (typeof actionCreators === 'function') {
	    return bindActionCreator(actionCreators, dispatch);
	  }
	
	  if (typeof actionCreators !== 'object' || actionCreators === null) {
	    throw new Error('bindActionCreators expected an object or a function, instead received ' + (actionCreators === null ? 'null' : typeof actionCreators) + '. ' + 'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?');
	  }
	
	  var keys = Object.keys(actionCreators);
	  var boundActionCreators = {};
	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    var actionCreator = actionCreators[key];
	    if (typeof actionCreator === 'function') {
	      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
	    }
	  }
	  return boundActionCreators;
	}

/***/ },
/* 15 */
/*!****************************************!*\
  !*** ./~/redux/lib/applyMiddleware.js ***!
  \****************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	exports.__esModule = true;
	exports["default"] = applyMiddleware;
	
	var _compose = __webpack_require__(/*! ./compose */ 16);
	
	var _compose2 = _interopRequireDefault(_compose);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	/**
	 * Creates a store enhancer that applies middleware to the dispatch method
	 * of the Redux store. This is handy for a variety of tasks, such as expressing
	 * asynchronous actions in a concise manner, or logging every action payload.
	 *
	 * See `redux-thunk` package as an example of the Redux middleware.
	 *
	 * Because middleware is potentially asynchronous, this should be the first
	 * store enhancer in the composition chain.
	 *
	 * Note that each middleware will be given the `dispatch` and `getState` functions
	 * as named arguments.
	 *
	 * @param {...Function} middlewares The middleware chain to be applied.
	 * @returns {Function} A store enhancer applying the middleware.
	 */
	function applyMiddleware() {
	  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
	    middlewares[_key] = arguments[_key];
	  }
	
	  return function (createStore) {
	    return function (reducer, initialState, enhancer) {
	      var store = createStore(reducer, initialState, enhancer);
	      var _dispatch = store.dispatch;
	      var chain = [];
	
	      var middlewareAPI = {
	        getState: store.getState,
	        dispatch: function dispatch(action) {
	          return _dispatch(action);
	        }
	      };
	      chain = middlewares.map(function (middleware) {
	        return middleware(middlewareAPI);
	      });
	      _dispatch = _compose2["default"].apply(undefined, chain)(store.dispatch);
	
	      return _extends({}, store, {
	        dispatch: _dispatch
	      });
	    };
	  };
	}

/***/ },
/* 16 */
/*!********************************!*\
  !*** ./~/redux/lib/compose.js ***!
  \********************************/
/***/ function(module, exports) {

	"use strict";
	
	exports.__esModule = true;
	exports["default"] = compose;
	/**
	 * Composes single-argument functions from right to left.
	 *
	 * @param {...Function} funcs The functions to compose.
	 * @returns {Function} A function obtained by composing functions from right to
	 * left. For example, compose(f, g, h) is identical to arg => f(g(h(arg))).
	 */
	function compose() {
	  for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
	    funcs[_key] = arguments[_key];
	  }
	
	  return function () {
	    if (funcs.length === 0) {
	      return arguments.length <= 0 ? undefined : arguments[0];
	    }
	
	    var last = funcs[funcs.length - 1];
	    var rest = funcs.slice(0, -1);
	
	    return rest.reduceRight(function (composed, f) {
	      return f(composed);
	    }, last.apply(undefined, arguments));
	  };
	}

/***/ },
/* 17 */
/*!************************************!*\
  !*** ./~/react-redux/lib/index.js ***!
  \************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.connect = exports.Provider = undefined;
	
	var _Provider = __webpack_require__(/*! ./components/Provider */ 18);
	
	var _Provider2 = _interopRequireDefault(_Provider);
	
	var _connect = __webpack_require__(/*! ./components/connect */ 20);
	
	var _connect2 = _interopRequireDefault(_connect);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	exports.Provider = _Provider2["default"];
	exports.connect = _connect2["default"];

/***/ },
/* 18 */
/*!**************************************************!*\
  !*** ./~/react-redux/lib/components/Provider.js ***!
  \**************************************************/
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	exports.__esModule = true;
	exports["default"] = undefined;
	
	var _react = __webpack_require__(/*! react */ 1);
	
	var _storeShape = __webpack_require__(/*! ../utils/storeShape */ 19);
	
	var _storeShape2 = _interopRequireDefault(_storeShape);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var didWarnAboutReceivingStore = false;
	function warnAboutReceivingStore() {
	  if (didWarnAboutReceivingStore) {
	    return;
	  }
	  didWarnAboutReceivingStore = true;
	
	  /* eslint-disable no-console */
	  if (typeof console !== 'undefined' && typeof console.error === 'function') {
	    console.error('<Provider> does not support changing `store` on the fly. ' + 'It is most likely that you see this error because you updated to ' + 'Redux 2.x and React Redux 2.x which no longer hot reload reducers ' + 'automatically. See https://github.com/rackt/react-redux/releases/' + 'tag/v2.0.0 for the migration instructions.');
	  }
	  /* eslint-disable no-console */
	}
	
	var Provider = function (_Component) {
	  _inherits(Provider, _Component);
	
	  Provider.prototype.getChildContext = function getChildContext() {
	    return { store: this.store };
	  };
	
	  function Provider(props, context) {
	    _classCallCheck(this, Provider);
	
	    var _this = _possibleConstructorReturn(this, _Component.call(this, props, context));
	
	    _this.store = props.store;
	    return _this;
	  }
	
	  Provider.prototype.render = function render() {
	    var children = this.props.children;
	
	    return _react.Children.only(children);
	  };
	
	  return Provider;
	}(_react.Component);
	
	exports["default"] = Provider;
	
	if (process.env.NODE_ENV !== 'production') {
	  Provider.prototype.componentWillReceiveProps = function (nextProps) {
	    var store = this.store;
	    var nextStore = nextProps.store;
	
	    if (store !== nextStore) {
	      warnAboutReceivingStore();
	    }
	  };
	}
	
	Provider.propTypes = {
	  store: _storeShape2["default"].isRequired,
	  children: _react.PropTypes.element.isRequired
	};
	Provider.childContextTypes = {
	  store: _storeShape2["default"].isRequired
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! (webpack)/~/process/browser.js */ 7)))

/***/ },
/* 19 */
/*!***********************************************!*\
  !*** ./~/react-redux/lib/utils/storeShape.js ***!
  \***********************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _react = __webpack_require__(/*! react */ 1);
	
	exports["default"] = _react.PropTypes.shape({
	  subscribe: _react.PropTypes.func.isRequired,
	  dispatch: _react.PropTypes.func.isRequired,
	  getState: _react.PropTypes.func.isRequired
	});

/***/ },
/* 20 */
/*!*************************************************!*\
  !*** ./~/react-redux/lib/components/connect.js ***!
  \*************************************************/
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	exports.__esModule = true;
	exports["default"] = connect;
	
	var _react = __webpack_require__(/*! react */ 1);
	
	var _storeShape = __webpack_require__(/*! ../utils/storeShape */ 19);
	
	var _storeShape2 = _interopRequireDefault(_storeShape);
	
	var _shallowEqual = __webpack_require__(/*! ../utils/shallowEqual */ 21);
	
	var _shallowEqual2 = _interopRequireDefault(_shallowEqual);
	
	var _wrapActionCreators = __webpack_require__(/*! ../utils/wrapActionCreators */ 22);
	
	var _wrapActionCreators2 = _interopRequireDefault(_wrapActionCreators);
	
	var _isPlainObject = __webpack_require__(/*! lodash/isPlainObject */ 9);
	
	var _isPlainObject2 = _interopRequireDefault(_isPlainObject);
	
	var _hoistNonReactStatics = __webpack_require__(/*! hoist-non-react-statics */ 23);
	
	var _hoistNonReactStatics2 = _interopRequireDefault(_hoistNonReactStatics);
	
	var _invariant = __webpack_require__(/*! invariant */ 24);
	
	var _invariant2 = _interopRequireDefault(_invariant);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var defaultMapStateToProps = function defaultMapStateToProps(state) {
	  return {};
	}; // eslint-disable-line no-unused-vars
	var defaultMapDispatchToProps = function defaultMapDispatchToProps(dispatch) {
	  return { dispatch: dispatch };
	};
	var defaultMergeProps = function defaultMergeProps(stateProps, dispatchProps, parentProps) {
	  return _extends({}, parentProps, stateProps, dispatchProps);
	};
	
	function getDisplayName(WrappedComponent) {
	  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
	}
	
	function checkStateShape(stateProps, dispatch) {
	  (0, _invariant2["default"])((0, _isPlainObject2["default"])(stateProps), '`%sToProps` must return an object. Instead received %s.', dispatch ? 'mapDispatch' : 'mapState', stateProps);
	  return stateProps;
	}
	
	// Helps track hot reloading.
	var nextVersion = 0;
	
	function connect(mapStateToProps, mapDispatchToProps, mergeProps) {
	  var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
	
	  var shouldSubscribe = Boolean(mapStateToProps);
	  var mapState = mapStateToProps || defaultMapStateToProps;
	  var mapDispatch = (0, _isPlainObject2["default"])(mapDispatchToProps) ? (0, _wrapActionCreators2["default"])(mapDispatchToProps) : mapDispatchToProps || defaultMapDispatchToProps;
	
	  var finalMergeProps = mergeProps || defaultMergeProps;
	  var checkMergedEquals = finalMergeProps !== defaultMergeProps;
	  var _options$pure = options.pure;
	  var pure = _options$pure === undefined ? true : _options$pure;
	  var _options$withRef = options.withRef;
	  var withRef = _options$withRef === undefined ? false : _options$withRef;
	
	  // Helps track hot reloading.
	
	  var version = nextVersion++;
	
	  function computeMergedProps(stateProps, dispatchProps, parentProps) {
	    var mergedProps = finalMergeProps(stateProps, dispatchProps, parentProps);
	    (0, _invariant2["default"])((0, _isPlainObject2["default"])(mergedProps), '`mergeProps` must return an object. Instead received %s.', mergedProps);
	    return mergedProps;
	  }
	
	  return function wrapWithConnect(WrappedComponent) {
	    var Connect = function (_Component) {
	      _inherits(Connect, _Component);
	
	      Connect.prototype.shouldComponentUpdate = function shouldComponentUpdate() {
	        return !pure || this.haveOwnPropsChanged || this.hasStoreStateChanged;
	      };
	
	      function Connect(props, context) {
	        _classCallCheck(this, Connect);
	
	        var _this = _possibleConstructorReturn(this, _Component.call(this, props, context));
	
	        _this.version = version;
	        _this.store = props.store || context.store;
	
	        (0, _invariant2["default"])(_this.store, 'Could not find "store" in either the context or ' + ('props of "' + _this.constructor.displayName + '". ') + 'Either wrap the root component in a <Provider>, ' + ('or explicitly pass "store" as a prop to "' + _this.constructor.displayName + '".'));
	
	        var storeState = _this.store.getState();
	        _this.state = { storeState: storeState };
	        _this.clearCache();
	        return _this;
	      }
	
	      Connect.prototype.computeStateProps = function computeStateProps(store, props) {
	        if (!this.finalMapStateToProps) {
	          return this.configureFinalMapState(store, props);
	        }
	
	        var state = store.getState();
	        var stateProps = this.doStatePropsDependOnOwnProps ? this.finalMapStateToProps(state, props) : this.finalMapStateToProps(state);
	
	        return checkStateShape(stateProps);
	      };
	
	      Connect.prototype.configureFinalMapState = function configureFinalMapState(store, props) {
	        var mappedState = mapState(store.getState(), props);
	        var isFactory = typeof mappedState === 'function';
	
	        this.finalMapStateToProps = isFactory ? mappedState : mapState;
	        this.doStatePropsDependOnOwnProps = this.finalMapStateToProps.length !== 1;
	
	        return isFactory ? this.computeStateProps(store, props) : checkStateShape(mappedState);
	      };
	
	      Connect.prototype.computeDispatchProps = function computeDispatchProps(store, props) {
	        if (!this.finalMapDispatchToProps) {
	          return this.configureFinalMapDispatch(store, props);
	        }
	
	        var dispatch = store.dispatch;
	
	        var dispatchProps = this.doDispatchPropsDependOnOwnProps ? this.finalMapDispatchToProps(dispatch, props) : this.finalMapDispatchToProps(dispatch);
	
	        return checkStateShape(dispatchProps, true);
	      };
	
	      Connect.prototype.configureFinalMapDispatch = function configureFinalMapDispatch(store, props) {
	        var mappedDispatch = mapDispatch(store.dispatch, props);
	        var isFactory = typeof mappedDispatch === 'function';
	
	        this.finalMapDispatchToProps = isFactory ? mappedDispatch : mapDispatch;
	        this.doDispatchPropsDependOnOwnProps = this.finalMapDispatchToProps.length !== 1;
	
	        return isFactory ? this.computeDispatchProps(store, props) : checkStateShape(mappedDispatch, true);
	      };
	
	      Connect.prototype.updateStatePropsIfNeeded = function updateStatePropsIfNeeded() {
	        var nextStateProps = this.computeStateProps(this.store, this.props);
	        if (this.stateProps && (0, _shallowEqual2["default"])(nextStateProps, this.stateProps)) {
	          return false;
	        }
	
	        this.stateProps = nextStateProps;
	        return true;
	      };
	
	      Connect.prototype.updateDispatchPropsIfNeeded = function updateDispatchPropsIfNeeded() {
	        var nextDispatchProps = this.computeDispatchProps(this.store, this.props);
	        if (this.dispatchProps && (0, _shallowEqual2["default"])(nextDispatchProps, this.dispatchProps)) {
	          return false;
	        }
	
	        this.dispatchProps = nextDispatchProps;
	        return true;
	      };
	
	      Connect.prototype.updateMergedPropsIfNeeded = function updateMergedPropsIfNeeded() {
	        var nextMergedProps = computeMergedProps(this.stateProps, this.dispatchProps, this.props);
	        if (this.mergedProps && checkMergedEquals && (0, _shallowEqual2["default"])(nextMergedProps, this.mergedProps)) {
	          return false;
	        }
	
	        this.mergedProps = nextMergedProps;
	        return true;
	      };
	
	      Connect.prototype.isSubscribed = function isSubscribed() {
	        return typeof this.unsubscribe === 'function';
	      };
	
	      Connect.prototype.trySubscribe = function trySubscribe() {
	        if (shouldSubscribe && !this.unsubscribe) {
	          this.unsubscribe = this.store.subscribe(this.handleChange.bind(this));
	          this.handleChange();
	        }
	      };
	
	      Connect.prototype.tryUnsubscribe = function tryUnsubscribe() {
	        if (this.unsubscribe) {
	          this.unsubscribe();
	          this.unsubscribe = null;
	        }
	      };
	
	      Connect.prototype.componentDidMount = function componentDidMount() {
	        this.trySubscribe();
	      };
	
	      Connect.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
	        if (!pure || !(0, _shallowEqual2["default"])(nextProps, this.props)) {
	          this.haveOwnPropsChanged = true;
	        }
	      };
	
	      Connect.prototype.componentWillUnmount = function componentWillUnmount() {
	        this.tryUnsubscribe();
	        this.clearCache();
	      };
	
	      Connect.prototype.clearCache = function clearCache() {
	        this.dispatchProps = null;
	        this.stateProps = null;
	        this.mergedProps = null;
	        this.haveOwnPropsChanged = true;
	        this.hasStoreStateChanged = true;
	        this.renderedElement = null;
	        this.finalMapDispatchToProps = null;
	        this.finalMapStateToProps = null;
	      };
	
	      Connect.prototype.handleChange = function handleChange() {
	        if (!this.unsubscribe) {
	          return;
	        }
	
	        var prevStoreState = this.state.storeState;
	        var storeState = this.store.getState();
	
	        if (!pure || prevStoreState !== storeState) {
	          this.hasStoreStateChanged = true;
	          this.setState({ storeState: storeState });
	        }
	      };
	
	      Connect.prototype.getWrappedInstance = function getWrappedInstance() {
	        (0, _invariant2["default"])(withRef, 'To access the wrapped instance, you need to specify ' + '{ withRef: true } as the fourth argument of the connect() call.');
	
	        return this.refs.wrappedInstance;
	      };
	
	      Connect.prototype.render = function render() {
	        var haveOwnPropsChanged = this.haveOwnPropsChanged;
	        var hasStoreStateChanged = this.hasStoreStateChanged;
	        var renderedElement = this.renderedElement;
	
	        this.haveOwnPropsChanged = false;
	        this.hasStoreStateChanged = false;
	
	        var shouldUpdateStateProps = true;
	        var shouldUpdateDispatchProps = true;
	        if (pure && renderedElement) {
	          shouldUpdateStateProps = hasStoreStateChanged || haveOwnPropsChanged && this.doStatePropsDependOnOwnProps;
	          shouldUpdateDispatchProps = haveOwnPropsChanged && this.doDispatchPropsDependOnOwnProps;
	        }
	
	        var haveStatePropsChanged = false;
	        var haveDispatchPropsChanged = false;
	        if (shouldUpdateStateProps) {
	          haveStatePropsChanged = this.updateStatePropsIfNeeded();
	        }
	        if (shouldUpdateDispatchProps) {
	          haveDispatchPropsChanged = this.updateDispatchPropsIfNeeded();
	        }
	
	        var haveMergedPropsChanged = true;
	        if (haveStatePropsChanged || haveDispatchPropsChanged || haveOwnPropsChanged) {
	          haveMergedPropsChanged = this.updateMergedPropsIfNeeded();
	        } else {
	          haveMergedPropsChanged = false;
	        }
	
	        if (!haveMergedPropsChanged && renderedElement) {
	          return renderedElement;
	        }
	
	        if (withRef) {
	          this.renderedElement = (0, _react.createElement)(WrappedComponent, _extends({}, this.mergedProps, {
	            ref: 'wrappedInstance'
	          }));
	        } else {
	          this.renderedElement = (0, _react.createElement)(WrappedComponent, this.mergedProps);
	        }
	
	        return this.renderedElement;
	      };
	
	      return Connect;
	    }(_react.Component);
	
	    Connect.displayName = 'Connect(' + getDisplayName(WrappedComponent) + ')';
	    Connect.WrappedComponent = WrappedComponent;
	    Connect.contextTypes = {
	      store: _storeShape2["default"]
	    };
	    Connect.propTypes = {
	      store: _storeShape2["default"]
	    };
	
	    if (process.env.NODE_ENV !== 'production') {
	      Connect.prototype.componentWillUpdate = function componentWillUpdate() {
	        if (this.version === version) {
	          return;
	        }
	
	        // We are hot reloading!
	        this.version = version;
	        this.trySubscribe();
	        this.clearCache();
	      };
	    }
	
	    return (0, _hoistNonReactStatics2["default"])(Connect, WrappedComponent);
	  };
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! (webpack)/~/process/browser.js */ 7)))

/***/ },
/* 21 */
/*!*************************************************!*\
  !*** ./~/react-redux/lib/utils/shallowEqual.js ***!
  \*************************************************/
/***/ function(module, exports) {

	"use strict";
	
	exports.__esModule = true;
	exports["default"] = shallowEqual;
	function shallowEqual(objA, objB) {
	  if (objA === objB) {
	    return true;
	  }
	
	  var keysA = Object.keys(objA);
	  var keysB = Object.keys(objB);
	
	  if (keysA.length !== keysB.length) {
	    return false;
	  }
	
	  // Test for A's keys different from B.
	  var hasOwn = Object.prototype.hasOwnProperty;
	  for (var i = 0; i < keysA.length; i++) {
	    if (!hasOwn.call(objB, keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
	      return false;
	    }
	  }
	
	  return true;
	}

/***/ },
/* 22 */
/*!*******************************************************!*\
  !*** ./~/react-redux/lib/utils/wrapActionCreators.js ***!
  \*******************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports["default"] = wrapActionCreators;
	
	var _redux = __webpack_require__(/*! redux */ 6);
	
	function wrapActionCreators(actionCreators) {
	  return function (dispatch) {
	    return (0, _redux.bindActionCreators)(actionCreators, dispatch);
	  };
	}

/***/ },
/* 23 */
/*!********************************************!*\
  !*** ./~/hoist-non-react-statics/index.js ***!
  \********************************************/
/***/ function(module, exports) {

	/**
	 * Copyright 2015, Yahoo! Inc.
	 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
	 */
	'use strict';
	
	var REACT_STATICS = {
	    childContextTypes: true,
	    contextTypes: true,
	    defaultProps: true,
	    displayName: true,
	    getDefaultProps: true,
	    mixins: true,
	    propTypes: true,
	    type: true
	};
	
	var KNOWN_STATICS = {
	    name: true,
	    length: true,
	    prototype: true,
	    caller: true,
	    arguments: true,
	    arity: true
	};
	
	module.exports = function hoistNonReactStatics(targetComponent, sourceComponent) {
	    var keys = Object.getOwnPropertyNames(sourceComponent);
	    for (var i=0; i<keys.length; ++i) {
	        if (!REACT_STATICS[keys[i]] && !KNOWN_STATICS[keys[i]]) {
	            try {
	                targetComponent[keys[i]] = sourceComponent[keys[i]];
	            } catch (error) {
	
	            }
	        }
	    }
	
	    return targetComponent;
	};


/***/ },
/* 24 */
/*!********************************!*\
  !*** ./~/invariant/browser.js ***!
  \********************************/
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */
	
	'use strict';
	
	/**
	 * Use invariant() to assert state which your program assumes to be true.
	 *
	 * Provide sprintf-style format (only %s is supported) and arguments
	 * to provide information about what broke and what you were
	 * expecting.
	 *
	 * The invariant message will be stripped in production, but the invariant
	 * will remain to ensure logic does not differ in production.
	 */
	
	var invariant = function(condition, format, a, b, c, d, e, f) {
	  if (process.env.NODE_ENV !== 'production') {
	    if (format === undefined) {
	      throw new Error('invariant requires an error message argument');
	    }
	  }
	
	  if (!condition) {
	    var error;
	    if (format === undefined) {
	      error = new Error(
	        'Minified exception occurred; use the non-minified dev environment ' +
	        'for the full error message and additional helpful warnings.'
	      );
	    } else {
	      var args = [a, b, c, d, e, f];
	      var argIndex = 0;
	      error = new Error(
	        format.replace(/%s/g, function() { return args[argIndex++]; })
	      );
	      error.name = 'Invariant Violation';
	    }
	
	    error.framesToPop = 1; // we don't care about invariant's own frame
	    throw error;
	  }
	};
	
	module.exports = invariant;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! (webpack)/~/process/browser.js */ 7)))

/***/ },
/* 25 */,
/* 26 */,
/* 27 */
/*!*************************************!*\
  !*** ./source/sample07/counter.tsx ***!
  \*************************************/
/***/ function(module, exports, __webpack_require__) {

	/// <reference path='../../typings/browser.d.ts'/>
	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var React = __webpack_require__(/*! react */ 1);
	var react_redux_1 = __webpack_require__(/*! react-redux */ 17);
	var Counter = (function (_super) {
	    __extends(Counter, _super);
	    function Counter() {
	        _super.apply(this, arguments);
	    }
	    Counter.prototype.render = function () {
	        var _this = this;
	        var field = this.props.field, step = this.props.step || 1;
	        return (React.createElement("div", null, React.createElement("p", null, React.createElement("label", null, field, ": "), React.createElement("b", null, this.props.counter)), React.createElement("button", {style: { width: 30, margin: 2 }, onClick: function (e) { return _this.props.decr(field, step); }}, "-"), React.createElement("button", {style: { width: 30, margin: 2 }, onClick: function (e) { return _this.props.incr(field, step); }}, "+")));
	    };
	    return Counter;
	}(React.Component));
	var mapStateToProps = function (state, props) { return ({ counter: state[props.field] || 0 }); };
	var mapDispatchToProps = function (dispatch) { return ({
	    incr: function (field, step) {
	        dispatch({ type: 'COUNTER_CHANGE', field: field, by: step });
	    },
	    decr: function (field, step) {
	        dispatch({ type: 'COUNTER_CHANGE', field: field, by: -1 * step });
	    }
	}); };
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = react_redux_1.connect(mapStateToProps, mapDispatchToProps)(Counter);


/***/ },
/* 28 */
/*!******************************************!*\
  !*** ./source/sample07/actionplayer.tsx ***!
  \******************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var React = __webpack_require__(/*! react */ 1);
	var ActionPlayer = (function (_super) {
	    __extends(ActionPlayer, _super);
	    function ActionPlayer() {
	        _super.apply(this, arguments);
	    }
	    ActionPlayer.prototype.componentDidMount = function () {
	        var _this = this;
	        this.unsubscribe = this.props.store.subscribe(function () { return _this.forceUpdate(); });
	    };
	    ActionPlayer.prototype.componentWillUnmount = function () {
	        this.unsubscribe();
	    };
	    ActionPlayer.prototype.render = function () {
	        var _this = this;
	        return (React.createElement("div", null, React.createElement("button", {onClick: function (e) { return _this.replayActions(); }}, "replay"), React.createElement("p", null, React.createElement("b", null, this.props.actions.length), " actions"), React.createElement("button", {onClick: function (e) { return _this.undoAction(); }}, "undo"), " ", React.createElement("span", null), React.createElement("button", {onClick: function (e) { return _this.resetState(); }}, "clear")));
	    };
	    ActionPlayer.prototype.resetState = function () {
	        this.props.store.dispatch({ type: "LOAD", state: this.props.defaultState });
	        this.props.actions.length = 0;
	    };
	    ActionPlayer.prototype.replayActions = function () {
	        var _this = this;
	        var snapshot = this.props.actions.slice(0);
	        this.resetState();
	        snapshot.forEach(function (action, i) {
	            return setTimeout(function () { return _this.props.store.dispatch(action); }, 10 * i);
	        });
	    };
	    ActionPlayer.prototype.undoAction = function () {
	        var _this = this;
	        var snapshot = this.props.actions.slice(0, this.props.actions.length - 1);
	        this.resetState();
	        snapshot.forEach(function (action) { return _this.props.store.dispatch(action); });
	    };
	    return ActionPlayer;
	}(React.Component));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = ActionPlayer;


/***/ },
/* 29 */
/*!****************************************!*\
  !*** ./source/sample07/shapemaker.tsx ***!
  \****************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var React = __webpack_require__(/*! react */ 1);
	var react_redux_1 = __webpack_require__(/*! react-redux */ 17);
	var colorpicker_1 = __webpack_require__(/*! ./colorpicker */ 30);
	var ShapeMaker = (function (_super) {
	    __extends(ShapeMaker, _super);
	    function ShapeMaker(props, context) {
	        _super.call(this, props, context);
	        this.state = { top: props.top, left: props.left };
	    }
	    ShapeMaker.prototype.render = function () {
	        var _this = this;
	        var width = this.props.width, height = this.props.height, background = this.props.color;
	        var color = colorpicker_1.isDark(background) ? '#fff' : '#000';
	        return (React.createElement("div", null, React.createElement("p", null, React.createElement("label", null, "size: "), React.createElement("b", null, height, "x", width)), React.createElement("div", {style: { height: height, width: width, background: background, color: color, lineHeight: height + "px", margin: "auto" }}, "(", this.state.top, ", ", this.state.left, ")"), React.createElement("div", null, React.createElement("p", null, React.createElement("label", null, "position: "), React.createElement("input", {style: { width: 30 }, defaultValue: this.props.top, onChange: function (e) { return _this.handleTop(e); }}), React.createElement("span", null, ", "), React.createElement("input", {style: { width: 30 }, defaultValue: this.props.left, onChange: function (e) { return _this.handleLeft(e); }})), React.createElement("button", {onClick: function (e) { return _this.props.addShape(background, height, width, _this.state.top, _this.state.left); }}, "Add Shape"))));
	    };
	    ShapeMaker.prototype.handleTop = function (e) {
	        var top = parseInt(e.target.value);
	        if (!isNaN(top))
	            this.setState({ top: top });
	    };
	    ShapeMaker.prototype.handleLeft = function (e) {
	        var left = parseInt(e.target.value);
	        if (!isNaN(left))
	            this.setState({ left: left });
	    };
	    return ShapeMaker;
	}(React.Component));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = react_redux_1.connect(function (state) { return ({
	    width: state.width, height: state.height, color: state.color,
	    top: state.nextShapeId * 10, left: state.nextShapeId * 10
	}); }, function (dispatch) { return ({
	    addShape: function (color, height, width, top, left) {
	        dispatch({ type: 'SHAPE_ADD', height: height, width: width, color: color, top: top, left: left });
	    }
	}); })(ShapeMaker);


/***/ },
/* 30 */
/*!*****************************************!*\
  !*** ./source/sample07/colorpicker.tsx ***!
  \*****************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var React = __webpack_require__(/*! react */ 1);
	var NumberPicker = (function (_super) {
	    __extends(NumberPicker, _super);
	    function NumberPicker() {
	        _super.apply(this, arguments);
	    }
	    NumberPicker.prototype.render = function () {
	        var _this = this;
	        return (React.createElement("p", null, React.createElement("input", {type: "range", value: this.props.value.toString(), min: "0", max: "255", onChange: function (e) { return _this.handleChange(e); }}), React.createElement("label", null, " ", this.props.name, ": "), React.createElement("b", null, this.props.value)));
	    };
	    NumberPicker.prototype.handleChange = function (event) {
	        var e = event.target;
	        this.props.onChange(parseInt(e.value));
	    };
	    return NumberPicker;
	}(React.Component));
	exports.NumberPicker = NumberPicker;
	var ColorPicker = (function (_super) {
	    __extends(ColorPicker, _super);
	    function ColorPicker() {
	        _super.apply(this, arguments);
	    }
	    ColorPicker.prototype.render = function () {
	        var _this = this;
	        var color = this.props.color;
	        var rgb = hexToRgb(color);
	        var textColor = exports.isDark(color) ? "#fff" : "#000";
	        return (React.createElement("div", null, React.createElement(NumberPicker, {name: "Red", value: rgb.r, onChange: function (n) { return _this.updateRed(n); }}), React.createElement(NumberPicker, {name: "Green", value: rgb.g, onChange: function (n) { return _this.updateGreen(n); }}), React.createElement(NumberPicker, {name: "Blue", value: rgb.b, onChange: function (n) { return _this.updateBlue(n); }}), React.createElement("div", {style: {
	            background: color, width: "100%", height: 40, lineHeight: "40px",
	            textAlign: "center", color: textColor
	        }}, color)));
	    };
	    ColorPicker.prototype.updateRed = function (n) {
	        var rgb = hexToRgb(this.props.color);
	        this.changeColor(rgbToHex(n, rgb.g, rgb.b));
	    };
	    ColorPicker.prototype.updateGreen = function (n) {
	        var rgb = hexToRgb(this.props.color);
	        this.changeColor(rgbToHex(rgb.r, n, rgb.b));
	    };
	    ColorPicker.prototype.updateBlue = function (n) {
	        var rgb = hexToRgb(this.props.color);
	        this.changeColor(rgbToHex(rgb.r, rgb.g, n));
	    };
	    ColorPicker.prototype.changeColor = function (color) {
	        this.props.onChange(color);
	    };
	    return ColorPicker;
	}(React.Component));
	exports.ColorPicker = ColorPicker;
	var componentToHex = function (c) {
	    var hex = c.toString(16);
	    return hex.length === 1 ? "0" + hex : hex;
	};
	var rgbToHex = function (r, g, b) { return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b); };
	var hexToRgb = function (hex) {
	    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	    return result ? {
	        r: parseInt(result[1], 16),
	        g: parseInt(result[2], 16),
	        b: parseInt(result[3], 16)
	    } : null;
	};
	var luminance = function (color) {
	    var rgb = hexToRgb(color);
	    return 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
	};
	exports.isDark = function (color) { return luminance(color) < 100; };


/***/ },
/* 31 */
/*!*****************************************!*\
  !*** ./source/sample07/shapeviewer.tsx ***!
  \*****************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var React = __webpack_require__(/*! react */ 1);
	var react_redux_1 = __webpack_require__(/*! react-redux */ 17);
	var colorpicker_1 = __webpack_require__(/*! ./colorpicker */ 30);
	var ShapeViewer = (function (_super) {
	    __extends(ShapeViewer, _super);
	    function ShapeViewer(props, context) {
	        _super.call(this, props, context);
	        this.state = { isDragging: false };
	    }
	    ShapeViewer.prototype.render = function () {
	        var _this = this;
	        return (React.createElement("div", {className: "noselect", style: { position: "relative", border: "solid 1px #ccc", width: 860, height: 500 }}, this.props.shapes.map(function (s) { return (React.createElement("div", {key: s.id, style: {
	            position: "absolute", top: s.top, left: s.left, color: colorpicker_1.isDark(s.color) ? '#fff' : '#000',
	            background: s.color, width: s.width, height: s.height,
	            lineHeight: s.height + "px", textAlign: "center", cursor: "move"
	        }, onMouseDown: function (e) { return _this.handleDragInit(e); }, onMouseUp: function (e) { return _this.setState({ isDragging: false }); }, onMouseOut: function (e) { return _this.setState({ isDragging: false }); }, onMouseMove: function (e) { return _this.handleDrag(s.id, s.height, s.width, e); }}, "(", s.top, ", ", s.left, ")")); })));
	    };
	    ShapeViewer.prototype.handleDragInit = function (e) {
	        var el = e.target;
	        while (el.nodeName !== "DIV")
	            el = el.parentNode; //don't select text SPAN node
	        var top = parseInt(el.style.top) || 0;
	        var left = parseInt(el.style.left) || 0;
	        this.setState({ isDragging: true, orig: { x: e.pageX - left, y: e.pageY - top } });
	    };
	    ShapeViewer.prototype.handleDrag = function (id, height, width, e) {
	        if (this.state.isDragging) {
	            this.props.updateShape(id, e.pageY - this.state.orig.y, e.pageX - this.state.orig.x);
	        }
	    };
	    return ShapeViewer;
	}(React.Component));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = react_redux_1.connect(function (state) { return ({ shapes: state.shapes }); }, function (dispatch) { return ({
	    updateShape: function (id, top, left) { return dispatch({ type: "SHAPE_CHANGE", id: id, top: top, left: left }); }
	}); })(ShapeViewer);


/***/ },
/* 32 */
/*!*****************************************!*\
  !*** ./source/sample07/objectassign.ts ***!
  \*****************************************/
/***/ function(module, exports) {

	if (typeof Object.assign != "function") {
	    (function () {
	        Object.assign = function (target) {
	            "use strict";
	            if (target === undefined || target === null) {
	                throw new TypeError("Cannot convert undefined or null to object");
	            }
	            var output = Object(target);
	            for (var index = 1; index < arguments.length; index++) {
	                var source = arguments[index];
	                if (source !== undefined && source !== null) {
	                    for (var nextKey in source) {
	                        if (source.hasOwnProperty(nextKey)) {
	                            output[nextKey] = source[nextKey];
	                        }
	                    }
	                }
	            }
	            return output;
	        };
	    })();
	}


/***/ }
/******/ ]);
//# sourceMappingURL=sample07.js.map