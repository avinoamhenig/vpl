import shallowEqual from 'babel-loader!react-redux/src/utils/shallowEqual'
import { connect as origConnect } from 'react-redux'

const CANCEL_SYMBOL = Symbol("cancel-redux-connect");

const newUpdateStatePropsIfNeeded = function () {
	let nextStateProps;

	try {
		nextStateProps = this.computeStateProps(this.store, this.props);
	} catch (e) {
		if (e === CANCEL_SYMBOL) {
			return false;
		}

		throw e;
	}

	if (this.stateProps && shallowEqual(nextStateProps, this.stateProps)) {
		return false;
	}

	this.stateProps = nextStateProps;
	return true;
};

export const cancel = () => { throw CANCEL_SYMBOL; }
export const connect = (...args) => wrappedComponent => {
	let connectedComponent = origConnect(...args)(wrappedComponent);
	connectedComponent.prototype.updateStatePropsIfNeeded =
		newUpdateStatePropsIfNeeded;
	return connectedComponent;
};
