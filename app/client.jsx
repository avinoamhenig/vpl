import React from 'react'
import { render } from 'react-dom'
import Root from 'containers/Root'
import { Provider } from 'react-redux'
import configureStore from 'configureStore'
import historyRouteMiddleware from
	'lib/route-reducer/middleware/history'

if (module.hot) {
	module.hot.accept();
}

const
	rootEl = document.getElementById('app'),
	store = configureStore(window.__INITIAL_STATE__, historyRouteMiddleware);
render(<Root store={store} />, rootEl);
