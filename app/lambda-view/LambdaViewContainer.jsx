import React from 'react'
import { bindActionCreators, compose } from 'redux'
import { connect } from 'react-redux'
import { match } from 'lib/route-reducer'
import routes from 'routes'
import LambdaView from './LambdaView'
import { actions } from './lambdaViewReducer'
import { createSelector } from 'reselect'
import { getAstDepth } from 'ast'
import helmet from 'lib/helmetDecorator'

const lambdaInfoSel = createSelector(
	state => {
		let routeMatch = match(routes.desc, routes.LAMBDA, state.route.current);
		return state.ast.filter(l => l.name === routeMatch.params.id)[0];
	},
	lambda => {
		let nestedDepth = getAstDepth(lambda.body);
		return { lambda, nestedDepth };
	}
);
const mapStateToProps = state => ({
	...state.lambdaView,
	...lambdaInfoSel(state)
});
const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch);
export default compose(
	connect(mapStateToProps, mapDispatchToProps),
	helmet(({lambda}) => ({ title: '#' + lambda.name }))
)(LambdaView);
