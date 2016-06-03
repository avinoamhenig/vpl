import React from 'react'
import Helmet from 'react-helmet'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { matchOne, navigate } from 'lib/route-reducer'
import routes from 'routes'
import name from 'lib/name'
import LambdaViewContainer from 'containers/LambdaViewContainer'
import Radium from 'radium'

const App = name('App')(Radium(({
	route, navigate, ast
}) => {
	let routeMatch = matchOne(routes.desc, route);

	let noSelect = {
		WebkitTouchCallout: 'none',
		WebkitUserSelect: 'none',
		KhtmlUserSelect: 'none',
		MozUserSelect: 'none',
		msUserSelect: 'none',
		userSelect: 'none',
		WebkitTapHighlightColor: 'rgba(0,0,0,0)'
	};
	let markup = null;

	if (routeMatch.key === routes.LAMBDA) {
		markup = (<LambdaViewContainer />);
	} else if (routeMatch.key === routes.FN_LIST) {
		let listItems = ast.map(fnDef => {
			return (
				<li style={{ padding: 10 }} key={fnDef.name}>
					<a href={`/lambda/${fnDef.name}`}
					   key={fnDef.name}
					   style={{
					   	fontSize: 26,
					   	textDecoration: 'none',
					   	color: '#888'
					   }}
					   onClick={e => {
							 e.preventDefault();
							 navigate(`/lambda/${fnDef.name}`);
						 }}>{fnDef.name}</a>
				</li>
			);
		});
		markup = (<ul key="fn_list">{listItems}</ul>);
	}

	return (
		<div style={noSelect}>
			<Helmet
				defaultTitle="VPL"
				titleTemplate="VPL - %s"
				link={[
					{ rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.min.css' }
				]}
				meta={[
					{ charset: 'utf-8' },
					{ name: 'viewport',
						content: 'initial-scale=1, maximum-scale=1' }
				]}
				/>
			{ markup }
		</div>
	);
}));

const selector = (state) => ({
	route: state.route.current,
	ast: state.ast
});
const mapDispatch = (dispatch) => bindActionCreators(
	{navigate}, dispatch);
export default connect(selector, mapDispatch)(App);
