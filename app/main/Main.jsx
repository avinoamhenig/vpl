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
import {
	getLambdaByName,
	actions as astActions
} from 'ast'

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
)(({ route, navigate, ast, newFunction }) => {
	const s = computeStyles();
	const routeMatch = matchOne(routes.desc, route);
	const onAddLambdaClicked = () => {
		newFunction();
	};

	switch (routeMatch.key) {
		case routes.LAMBDA:
			return (
				<div style={s.lambdaEditContainer}>
					<div style={s.lambdaContainer}>
						<LambdaView
							lambda={getLambdaByName(routeMatch.params.id, ast)}
							/>
					</div>
					<div style={s.keyboardContainer}>
						<AstKeyboard />
					</div>
				</div>
			);
		case routes.FN_LIST:
			let listItems = ast.map(fnDef => {
				return (
					<li style={s.lambdaListItem} key={fnDef.name}>
						<a
							href={`#/lambda/${fnDef.name}`}
							key={fnDef.name}
							style={s.lambdaLink}
							onClick={e => {
								e.preventDefault();
								navigate(`/lambda/${fnDef.name}`);
							}}>{fnDef.name}</a>
					</li>
				);
			});
			return (
				<ul key="fn_list">
					{listItems}
					<li style={s.lambdaListItem}>
						<span
							key="add_lambda"
							style={s.addLambdaButton}
							onClick={onAddLambdaClicked}>
							<Icon icon="plus" />
						</span>
					</li>
				</ul>
			);
		default:
			return (<div>Route not found!</div>);
	}
});

const mapStateToProps = (state) => ({
	route: state.route.current,
	ast: state.ast
});
const mapDispatchToProps = (dispatch) => bindActionCreators({
	navigate,
	newFunction: astActions.newFunction
}, dispatch);
const MainContainer = connect(mapStateToProps, mapDispatchToProps)(Main);

export default MainContainer;
export { Main, MainContainer };
