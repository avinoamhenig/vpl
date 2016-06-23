import React from 'react'
import helmet from 'lib/helmetDecorator'
import { bindActionCreators, compose } from 'redux'
import { connect } from 'react-redux'
import { matchOne, navigate } from 'lib/route-reducer'
import routes from 'routes'
import name from 'lib/name'
import LambdaView from 'lambda-view'
import Radium from 'radium'
import AstKeyboard from 'ast-keyboard'
import Icon from 'lib/Icon'
import computeStyles from './mainStyles.js'
import { getIdentifier } from 'ast'

const Main = compose(
	name('Main'),
	helmet({
		defaultTitle: "VPL",
		titleTemplate: "VPL - %s",
		link: [
			{ rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.min.css' },
			{ rel: 'stylesheet', href: 'https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css' }
		],
		meta: [
			{ charset: 'utf-8' },
			{ name: 'viewport',
			  content: 'initial-scale=1, maximum-scale=1' }
		]
	}),
	Radium
)(p => {
	const { route, navigate, program, newFunction, loadSchemeProgram } = p;
	const s = computeStyles();
	const routeMatch = matchOne(routes.desc, route);

	switch (routeMatch.key) {
		case routes.FN:
			const identifier = getIdentifier(program, routeMatch.params.id);
			return (
				<div style={s.lambdaEditContainer}>
					<div style={s.lambdaContainer}>
						<LambdaView
							identifier={identifier}
							lambdaId={identifier.value}
							program={program}
							/>
					</div>
					<div style={s.keyboardContainer}>
						<AstKeyboard />
					</div>
				</div>
			);
		case routes.FN_LIST:
			return (
				<div style={s.lambdaEditContainer}>
					<div style={s.lambdaContainer}>
						<LambdaView
							identifier={null}
							expressionId={program.expression}
							program={program}
							/>
					</div>
					<div style={s.keyboardContainer}>
						<AstKeyboard />
					</div>
				</div>
			);
		default:
			return (<div>Route not found!</div>);
	}
});

const mapStateToProps = (state) => ({
	route: state.route.current,
	program: state.program
});
const mapDispatchToProps = (dispatch) => bindActionCreators({
	navigate
}, dispatch);
const MainContainer = connect(mapStateToProps, mapDispatchToProps)(Main);

export default MainContainer;
export { Main, MainContainer };
