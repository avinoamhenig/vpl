import express from 'express'
import favicon from 'serve-favicon'
import React from 'react'
import { renderToString, renderToStaticMarkup }
	from 'react-dom/server'
import Helmet from 'react-helmet'
import { Provider } from 'react-redux'
import configureStore from 'configureStore'
import Root from 'containers/Root'
import HTML from 'containers/HTML'
import memoryRouteMiddleware
	from 'lib/route-reducer/middleware/memory'

const
	app = express(),
	port = process.env.PORT || 3000,
	buildDir = require('path').resolve("..") + '/build';

// TODO change favicon cache time
app.use(favicon('./public/img/favicon.ico', '1m'));

if (__DEV__) {
	const
		webpack = require('webpack'),
		webpackConfig = require('../webpack.config')[0],
		compiler = webpack(webpackConfig);

	app.use(require('webpack-dev-middleware')(compiler, {
			noInfo: true,
			publicPath: '/public/js/'
	}));

	app.use(require("webpack-hot-middleware")(compiler));
}

app.use('/public', express.static(buildDir + '/public'));

app.use(function (req, res) {
	if (process.argv.indexOf('--server-render') === -1) {
		// bypass server render
		res.send('<div id="app"></div><script src="/public/js/client.js"></script>');
		return;
	}

	const
		store = configureStore(undefined, memoryRouteMiddleware, req.url),
		rendered = renderToString(<Root store={store} />),
		finalState = store.getState(),
		head = Helmet.rewind(),
		html = '<!doctype html>\n' + renderToStaticMarkup(
			<HTML state={finalState} head={head} markup={''} />
		);

	res.send(html);
});

app.listen(port, (error) => {
	if (error) {
		console.error(error);
	} else {
		console.log('Listening on port ' + port);
	}
});
