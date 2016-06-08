import React from 'react'
import { render } from 'react-dom'
import Root from 'Root'
import { Provider } from 'react-redux'
import configureStore from 'configureStore'
import routeMiddleware from 'lib/route-reducer/middleware/hash'
import { types as actionTypes } from 'redux-act';

if (module.hot) {
	module.hot.accept();
}

const
	rootEl = document.getElementById('app'),
	store = configureStore(window.__INITIAL_STATE__, routeMiddleware);
render(<Root store={store} />, rootEl);
