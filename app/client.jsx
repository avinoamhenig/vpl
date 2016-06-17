import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import configureStore from 'root/configureStore'
import routeMiddleware from 'lib/route-reducer/middleware/hash'
import Main from 'main'

const
	rootEl = document.getElementById('app'),
	store = configureStore(window.__INITIAL_STATE__, routeMiddleware);
render(<Provider store={store}><Main /></Provider>, rootEl);

// Hot module replacement for our components.
if (module.hot) {
	module.hot.accept('main', function () {
		const NextMain = require('main').default;
		render(<Provider store={store}><NextMain /></Provider>, rootEl);
	});
}
