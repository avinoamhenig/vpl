var
	webpack = require('webpack'),
	path = require('path'),
	fs = require('fs'),

	isDev = process.argv.indexOf('-d') !== -1
	        || (typeof __DEV__ !== 'undefined' && __DEV__),
	env   = isDev ? 'development' : 'production',
	constants = new webpack.DefinePlugin({
		'process.env.NODE_ENV' : JSON.stringify( env ),
		__ENV__   : JSON.stringify( env ),
		__DEV__   : JSON.stringify( isDev )
	}),

	node_modules = fs.readdirSync('node_modules').filter(function(x) { return x !== '.bin' }),

	common = {
		module: {
			loaders: [
				{
					test: /\.jsx?$/,
					exclude: /node_modules/,
					loaders: ['react-hot', 'babel-loader']
				}
			]
		},
		resolve: {
			extensions: ['', '.js', '.jsx'],
			root: path.resolve('./app')
		},
		devtool: 'sourcemap'
	};

module.exports = [
	Object.assign({}, common, {
		plugins: [
			constants,
			new webpack.optimize.OccurenceOrderPlugin(),
			new webpack.HotModuleReplacementPlugin(),
			new webpack.NoErrorsPlugin()
		],
		entry: {
			'client' : isDev ? ['./app/client.jsx', 'webpack-hot-middleware/client']
			                 : ['./app/client.jsx']
		},
		output: {
			path: path.resolve('./build/public/js'),
			publicPath: '/public/js/',
			filename: '[name].js'
		},
		target: 'web'
	}),
	Object.assign({}, common, {
		plugins: isDev ? [ constants ] : [ constants ],
		entry: {
			'server' : './app/server.jsx'
		},
		externals: node_modules,
		output: {
			path: path.resolve('./build'),
			filename: '[name].js',
			libraryTarget: 'commonjs'
		},
		target: 'node'
	})
];
