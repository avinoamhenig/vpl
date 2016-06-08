import { applyMiddleware, createStore, compose } from 'redux'
import { navigate } from 'lib/route-reducer'
import rootReducer from 'rootReducer'
import thunk from 'redux-thunk';
import { types as actionTypes } from 'redux-act';

export default (initialState, routeMiddleware, initialUrl) => {
	let storeEnhancers;
	if (__DEV__) {
		storeEnhancers = [
			applyMiddleware(thunk, routeMiddleware),
			require('lib/DevTools').default.instrument()
		];
	} else {
		storeEnhancers = [
			applyMiddleware(thunk, routeMiddleware)
		];
	}

	const store = compose(
		...storeEnhancers
	)(createStore)(rootReducer, initialState);

	if (typeof initialUrl !== 'undefined') {
		store.dispatch(navigate(initialUrl));
	}

	if (module.hot) {
		module.hot.accept('rootReducer', () => {

			// Clear action type cache so that redux-act doesn't throw
			// when we re-create the action creators.
			actionTypes.clear();

			store.replaceReducer(require('rootReducer').default)
		});
	}

	return store;
};
