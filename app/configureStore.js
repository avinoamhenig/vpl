import { applyMiddleware, createStore, compose } from 'redux'
import { navigate } from 'lib/route-reducer'
import rootReducer from 'rootReducer'

export default (initialState, routeMiddleware, initialUrl) => {
	let storeEnhancers;
	if (__DEV__) {
		storeEnhancers = [
			applyMiddleware(routeMiddleware),
			require('lib/DevTools').default.instrument()
		];
	} else {
		storeEnhancers = [
			applyMiddleware(routeMiddleware)
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
			store.replaceReducer(require('rootReducer').default)
		});
	}

	return store;
};
