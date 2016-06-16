import { applyMiddleware, createStore, compose } from 'redux'
import { navigate } from 'lib/route-reducer'
import rootReducer from './rootReducer'
import thunk from 'redux-thunk';

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
		module.hot.accept('root/rootReducer', () => {
			store.replaceReducer(require('root/rootReducer').default)
		});
	}

	return store;
};