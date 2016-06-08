import React from 'react'
import { connect } from 'react-redux'
import AstKeyboard from './AstKeyboard'
import { actions, createExpression } from 'ast'

const mapStateToProps = state => ({
	ast: state.ast,
	buttons: [
		{ display: '0', value: 0 },
		{ display: '1', value: 1 }
	]
});

const mapDispatchToProps = (dispatch, props) => ({
	onButtonPressed(value) {
		dispatch(actions.replaceSelectedExp(createExpression(value)));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(AstKeyboard);
