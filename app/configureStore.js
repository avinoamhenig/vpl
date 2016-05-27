import { applyMiddleware, createStore, compose } from 'redux'
import { navigate } from 'lib/route-reducer'
import rootReducer from 'reducers/root'

export default (initialState, routeMiddleware, initialUrl) => {
	let storeEnhancers;
	if (__DEV__) {
		storeEnhancers = [
			applyMiddleware(routeMiddleware),
			require('containers/DevTools').default.instrument()
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
		module.hot.accept('reducers/root', () => {
			store.replaceReducer(require('reducers/root').default)
		});
	}

	return store;
};
