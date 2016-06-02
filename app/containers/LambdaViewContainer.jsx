import React from 'react'
import { bindActionCreators, compose } from 'redux'
import { connect } from 'react-redux'
import { match } from 'lib/route-reducer'
import routes from 'routes'
import name from 'lib/name'
import LambdaView from 'components/LambdaView'
import { actions } from 'reducers/ui'
import { createSelector } from 'reselect'
import getAstDepth from 'lib/ast/getAstDepth'
import helmet from 'lib/helmetDecorator'

const lambdaInfoSel = createSelector(
	state => {
		let routeMatch = match(
			routes.desc, routes.LAMBDA, state.route.current);
		return state.ast.filter(l => l.name === routeMatch.params.id)[0];
	},
	lambda => {
		let nestingDepth = getAstDepth(lambda.body);
		return { lambda, nestingDepth };
	}
);
const selector = state => ({
	selectedExpId: state.ui.selectedExpId,
	expandedExpId: state.ui.expandedExpId,
	nestingLimit: state.ui.nestingLimit,
	...lambdaInfoSel(state)
});
const mapDispatch = (dispatch) => ({
	...bindActionCreators(actions, dispatch),
	onExpClicked: (e) => dispatch(actions.selectExp(e))
});
export default compose(
	connect(selector, mapDispatch),
	helmet(({lambda}) => ({ title: '#' + lambda.name }))
)(LambdaView);
