import React from 'react'
import { bindActionCreators, compose } from 'redux'
import { connect } from 'react-redux'
import { match } from 'lib/route-reducer'
import routes from 'routes'
import LambdaView from 'components/LambdaView'
import { actions } from 'reducers/ui'
import { createSelector } from 'reselect'
import getAstDepth from 'lib/ast/getAstDepth'
import helmet from 'lib/helmetDecorator'

const lambdaInfoSel = createSelector(
	state => {
		let routeMatch = match(
			routes.desc, routes.LAMBDA, state.route.current);;
		return state.ast.filter(l => l.name === routeMatch.params.id)[0];
	},
	lambda => {
		let nestedDepth = getAstDepth(lambda.body);
		return { lambda, nestedDepth };
	}
);
const selector = state => ({
	selectedExpId: state.ui.selectedExpId,
	expandedExpIds: state.ui.expandedExpIds,
	nestingLimit: state.ui.nestingLimit,
	ignoreInfix: state.ui.ignoreInfix,
	...lambdaInfoSel(state)
});
const mapDispatch = (dispatch) => ({
	onIncreaseNestingClicked: () => dispatch(
		actions.increaseNestingLimit()),
	onDecreaseNestingClicked: () => dispatch(
		actions.decreaseNestingLimit()),
	onExpClicked: (e, eLvl) => dispatch(actions.selectExp(e, eLvl)),
	onCollapsedExpClicked: (e, eLvl) =>
		dispatch(actions.toggleExpansion(e, eLvl)),
	onInfixToggleClicked: () => dispatch(actions.toggleInfix())
});
export default compose(
	connect(selector, mapDispatch),
	helmet(({lambda}) => ({ title: '#' + lambda.name }))
)(LambdaView);
