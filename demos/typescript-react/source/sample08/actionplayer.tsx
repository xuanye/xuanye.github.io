import * as React from "react";

export default class ActionPlayer extends React.Component<any, any> {
    private unsubscribe: Function;
    context: any;
    static contextTypes = {
        store: React.PropTypes.object
    }
    componentDidMount() {
        this.unsubscribe = this.context.store.subscribe(() => this.forceUpdate());
    }
    componentWillUnmount() {
        this.unsubscribe();
    }
    render() {
        return (
            <div>
                <button onClick={e => this.replayActions() }>replay</button>
                <p>
                    <b>{this.props.actions.length}</b> actions
                </p>
                <button onClick={e => this.undoAction() }>undo</button> <span></span>
                <button onClick={e => this.resetState() }>clear</button>
            </div>
        );
    }
    resetState() {
        this.context.store.dispatch({ type: "LOAD", state: this.props.defaultState });
        this.props.actions.length = 0;
    }
    replayActions() {
        const snapshot = this.props.actions.slice(0);
        this.resetState();

        snapshot.forEach((action, i) =>
            setTimeout(() => this.context.store.dispatch(action), 10 * i));
    }
    undoAction() {
        const snapshot = this.props.actions.slice(0, this.props.actions.length - 1);
        this.resetState();
        snapshot.forEach(action => this.context.store.dispatch(action));
    }
}