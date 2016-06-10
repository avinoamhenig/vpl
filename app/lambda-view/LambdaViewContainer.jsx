import React from 'react'
import { bindActionCreators, compose } from 'redux'
import { connect } from 'react-redux'
import { navigate } from 'lib/route-reducer'
import LambdaView from './LambdaView'
import { actions } from './lambdaViewReducer'
import helmet from 'lib/helmetDecorator'

const mapStateToProps = (state, props) => ({
	...state.lambdaView
});
const mapDispatchToProps = (dispatch) => bindActionCreators({
	...actions, navigate
}, dispatch);
export default compose(
	connect(mapStateToProps, mapDispatchToProps),
	helmet(({lambda}) => ({ title: '#' + lambda.name }))
)(LambdaView);
