import React from 'react'
import { bindActionCreators, compose } from 'redux'
import { connect } from 'react-redux'
import { navigate } from 'lib/route-reducer'
import LambdaView from './LambdaView'
import { actions } from './lambdaViewReducer'
import helmet from 'lib/helmetDecorator'
import { actions as astActions } from 'program'

const mapStateToProps = state => state.lambdaView;
const mapDispatchToProps = (dispatch) => bindActionCreators({
	...actions, navigate,
	newFunction: astActions.newFunction,
	loadJSONProgram: astActions.loadJSONProgram
}, dispatch);
export default compose(
	connect(mapStateToProps, mapDispatchToProps),
	helmet(({identifier}) => (identifier
		? { title: '#' + identifier.displayName }
		: {} ))
)(LambdaView);
