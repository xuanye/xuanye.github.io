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
  !*** ./source/sample03/app.tsx ***!
  \*********************************/
/***/ function(module, exports, __webpack_require__) {

	/// <reference path='../../typings/browser.d.ts'/>
	"use strict";
	var React = __webpack_require__(/*! react */ 1);
	var ReactDOM = __webpack_require__(/*! react-dom */ 2);
	var counter_1 = __webpack_require__(/*! ./counter */ 4);
	ReactDOM.render(React.createElement(counter_1.default, null), document.getElementById("content"));


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
/* 4 */
/*!*************************************!*\
  !*** ./source/sample03/counter.tsx ***!
  \*************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	/// <reference path='../../typings/browser.d.ts'/>
	var React = __webpack_require__(/*! react */ 1);
	var Counter = (function (_super) {
	    __extends(Counter, _super);
	    function Counter(props, context) {
	        _super.call(this, props, context);
	        this.state = { counter: 0 };
	    }
	    Counter.prototype.render = function () {
	        var _this = this;
	        return (React.createElement("div", null, React.createElement("p", null, React.createElement("label", null, "Counter: "), React.createElement("b", null, "#", this.state.counter)), React.createElement("button", {onClick: function (e) { return _this.incr(1); }}, "INCREMENT"), React.createElement("span", {style: { padding: "0 5px" }}), React.createElement("button", {onClick: function (e) { return _this.incr(-1); }}, "DECREMENT")));
	    };
	    Counter.prototype.incr = function (by) {
	        this.setState({ counter: this.state.counter + by });
	    };
	    return Counter;
	}(React.Component));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Counter;


/***/ }
/******/ ]);
//# sourceMappingURL=sample03.js.map