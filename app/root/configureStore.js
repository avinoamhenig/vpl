import { applyMiddleware, createStore, compose } from 'redux'
import { navigate } from 'lib/route-reducer'
import rootReducer from './rootReducer'
import thunk from 'redux-thunk';

export default (initialState, routeMiddleware, initialUrl) => {
	const store = compose(
		applyMiddleware(thunk, routeMiddleware),
		(typeof window === 'object'
		 && typeof window.devToolsExtension !== 'undefined'
			? window.devToolsExtension() : f => f)
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
