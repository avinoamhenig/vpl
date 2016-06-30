var
	webpack = require('webpack'),
	path = require('path'),

	isDev = process.argv.indexOf('-p') === -1;

module.exports = {
	module: {
		loaders: [{
			test: /\.jsx?$/,
			exclude: /node_modules/,
			loaders: ['babel-loader']
		}]
	},
	resolve: {
		extensions: ['', '.js', '.jsx'],
		root: path.resolve('./app')
	},
	devtool: isDev && 'eval-cheap-module-source-map',
	plugins: isDev ?[
		 new webpack.HotModuleReplacementPlugin()
	] : [],
	entry: { client: [ 'babel-polyfill', './app/client.jsx' ] },
	output: {
		path: path.resolve('./public/js'),
		publicPath: '/public/js/',
		filename: '[name].js'
	},
	target: 'web',
	devServer: {
		hot: true
	}
};
