import React from 'react'
import { bindActionCreators, compose } from 'redux'
import { connect, cancel } from 'lib/connect-cancel'
import { match, navigate } from 'lib/route-reducer'
import routes from 'routes'
import LambdaView from './LambdaView'
import { actions } from './lambdaViewReducer'
import { getLambdaByName, getAstDepth } from 'ast'
import helmet from 'lib/helmetDecorator'

const lambdaInfoSel = (state, props) => {
	if (props.lambda) {
		return {
			lambda: props.lambda,
			nestedDepth: getAstDepth(props.lambda)
		};
	}

	let routeMatch = match(routes.desc, routes.LAMBDA, state.route.current);
	if (!routeMatch) { cancel(); }
	const lambda = getLambdaByName(routeMatch.params.id, state.ast);
	return {
		lambda,
		nestedDepth: getAstDepth(lambda)
	};
};
const mapStateToProps = (state, props) => ({
	...state.lambdaView,
	...lambdaInfoSel(state, props)
});
const mapDispatchToProps = (dispatch) => bindActionCreators({
	...actions, navigate
}, dispatch);
export default compose(
	connect(mapStateToProps, mapDispatchToProps),
	helmet(({lambda}) => ({ title: '#' + lambda.name }))
)(LambdaView);
