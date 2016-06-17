import { applyMiddleware, createStore } from 'redux'
import { navigate } from 'lib/route-reducer'
import rootReducer from './rootReducer'
import thunk from 'redux-thunk';

export default (initialState, routeMiddleware, initialUrl) => {
	const store = applyMiddleware(
		thunk, routeMiddleware
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
