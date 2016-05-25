import React from 'react'
import Helmet from 'react-helmet'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { matchOne, navigate } from '../lib/route-reducer'
import routes from '../routes'
import name from '../lib/name'
import LambdaViewContainer from './LambdaViewContainer'
import Radium from 'radium'

const App = name('App')(Radium(({
	route, navigate
}) => {
	let routeMatch = matchOne(routes.desc, route);

	if (!routeMatch) {
		return (<div className="error">Route not found!</div>);
	}

	let noSelect = {
		WebkitTouchCallout: 'none',
		WebkitUserSelect: 'none',
		KhtmlUserSelect: 'none',
		MozUserSelect: 'none',
		msUserSelect: 'none',
		userSelect: 'none'
	};

	return (
		<div style={[noSelect]}>
			<Helmet title="VPL" />
			<Helmet link={[{"rel": "stylesheet", "href": "https://cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.min.css"}]} />
			{ routeMatch.key === routes.LAMBDA && <LambdaViewContainer />}
		</div>
	);
}));

const selector = (state) => ({ route: state.route.current });
const mapDispatch = (dispatch) => bindActionCreators({navigate}, dispatch);
export default connect(selector, mapDispatch)(App);
