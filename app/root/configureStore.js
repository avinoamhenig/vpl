import { applyMiddleware, createStore, compose } from 'redux'
import { navigate } from 'lib/route-reducer'
import rootReducer from './rootReducer'
import thunk from 'redux-thunk';
import { loadState, saveState } from './localStorage'
import throttle from 'lodash/throttle'

export default (routeMiddleware) => {
	const store = compose(
		applyMiddleware(thunk, routeMiddleware),
		(typeof window === 'object'
		 && typeof window.devToolsExtension !== 'undefined'
			? window.devToolsExtension() : f => f)
	)(createStore)(rootReducer, loadState());

	store.subscribe(throttle(() => saveState({
		program: store.getState().program
	}), 1000));

	if (module.hot) {
		module.hot.accept('root/rootReducer', () => {
			store.replaceReducer(require('root/rootReducer').default)
		});
	}

	return store;
};
