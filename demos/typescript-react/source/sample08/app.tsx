/// <reference path='../../typings/browser.d.ts'/>

import * as React from "react";
import * as ReactDOM from "react-dom";
import { createStore } from "redux";
import { Provider } from "react-redux";

import Counter from "./counter";
import History from "./history";
import ActionPlayer from "./actionplayer";
import ShapeMaker from "./shapemaker";
import ShapeViewer from "./shapeviewer";
import { ColorWrapper } from "./colorpicker";

import reducers from "./reducer";

var defaultState = { nextShapeId: 0, width: 100, height: 100, color: "#000000", shapes: [] };

var history = {
    states: [],
    stateIndex: 0,
    reset() {
        this.states = [];
        this.stateIndex = -1;
    },
    prev() { return this.states[--this.stateIndex]; },
    next() { return this.states[++this.stateIndex]; },
    goTo(index) { return this.states[this.stateIndex=index]; },
    canPrev() { return this.stateIndex <= 0; },
    canNext() { return this.stateIndex >= this.states.length - 1; },
    pushState(nextState) {
        this.states.push(nextState);
        this.stateIndex = this.states.length - 1;
    }
};

let store = createStore(
    (state, action) => {
        var reducer = reducers[action.type];
        var nextState = reducer != null
            ? reducer(state, action)
            : state;

        if (action.type !== 'LOAD')
         {
             history.pushState(nextState);
             console.log(history);
         }   

        return nextState;
    },
    defaultState);


//store.subscribe(() => { console.log(store.getState()) });

ReactDOM.render(
    <Provider store={store}>
        <table>
            <tbody>
            <tr>
                <td style={{width:220}}>
                    <Counter field="width" step={10} />
                    <Counter field="height" step={10} />
                    <ColorWrapper />
                </td>
                <td style={{verticalAlign:"top",textAlign:"center", width:500}}>
                    <h2>Preview</h2>
                    <ShapeMaker />
                </td>
                <td style={{verticalAlign:"top"}}>
                    <h2>History</h2>
                    <History history={history} defaultState={defaultState} />
                </td>
            </tr>
            <tr>
                <td colSpan={3}>
                    <h2 style={{margin:5,textAlign:'center'}}>Shapes</h2>
                    <ShapeViewer />
                </td>
            </tr>
            </tbody>
        </table>
    </Provider>,
    document.getElementById("content"));