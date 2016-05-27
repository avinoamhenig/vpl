import React from 'react'
import Helmet from 'react-helmet'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { match } from 'lib/route-reducer'
import routes from 'routes'
import name from 'lib/name'
import LambdaView from 'components/LambdaView'
import { actions } from 'reducers/ui'
import { createSelector } from 'reselect'
import getAstDepth from 'lib/ast/getAstDepth'

const LambdaViewContainer = name('LambdaViewContainer', ({
	selectedExpId, nestingLimit,
	selectExp, setNestingLimit,
	lambda, nestingDepth
}) => {
	if (lambda === null) {
		return (<div className="error">Lambda not found!</div>);
	}

	return (
		<div>
			<Helmet title={'#' + lambda.name} />
			<LambdaView
				lambda={lambda}
				selectedExpId={selectedExpId}
				onExpClicked={selectExp}
				nestingLimit={nestingLimit}
				setNestingLimit={setNestingLimit}
				nestingDepth={nestingDepth}
				/>
		</div>
	);
});

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
	nestingLimit: state.ui.nestingLimit,
	...lambdaInfoSel(state)
});
const mapDispatch = (dispatch) =>
	bindActionCreators(actions, dispatch);
export default connect(selector, mapDispatch)(LambdaViewContainer);
