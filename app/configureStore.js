import { applyMiddleware, createStore, compose } from 'redux'
import { navigate } from './lib/route-reducer'
import rootReducer from './reducers/root-reducer'

export default (initialState, routeMiddleware, initialUrl) => {
	let storeEnhancers;
	if (__DEV__) {
		storeEnhancers = [
			applyMiddleware(routeMiddleware),
			require('./components/DevTools').default.instrument()
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
		module.hot.accept('./reducers/root-reducer', () => {
			store.replaceReducer(require('./reducers/root-reducer').default)
		});
	}

	return store;
};
