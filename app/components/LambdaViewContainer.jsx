import React from 'react'
import Helmet from 'react-helmet'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { match } from '../lib/route-reducer'
import routes from '../routes'
import name from '../lib/name'
import LambdaView from './LambdaView'
import { actions } from '../reducers/ui'

const LambdaViewContainer = name('LambdaViewContainer', ({
	route, ast, selectedExpId, nestingLimit,
	selectExp, setNestingLimit
}) => {
	let routeMatch = match(routes.desc, routes.LAMBDA, route);

	if (!routeMatch) {
		return (<div className="error">Route not found!</div>);
	}

	let lambda = ast.filter(l => l.name === routeMatch.params.id)[0];

	if (lambda === null) {
		return (<div className="error">Lambda not found!</div>);
	}

	return (
		<LambdaView
			lambda={lambda}
			selectedExpId={selectedExpId}
			onExpClicked={selectExp}
			nestingLimit={nestingLimit}
			setNestingLimit={setNestingLimit}
			/>
	);
});

const selector = (state) => ({
	route: state.route.current,
	ast: state.ast,
	selectedExpId: state.ui.selectedExpId,
	nestingLimit: state.ui.nestingLimit
});
const mapDispatch = (dispatch) =>
	bindActionCreators(actions, dispatch);
export default connect(selector, mapDispatch)(LambdaViewContainer);
