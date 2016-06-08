import React from 'react'
import { connect } from 'react-redux'
import AstKeyboard from './AstKeyboard'
import { actions as astActions, createExpression } from 'ast'
import { actions } from './astKeyboardReducer'
import Icon from 'lib/Icon'

const mapStateToProps = state => ({
	...state.astKeyboard,
	ast: state.ast,
	buttons: [
		{ display: 0, value: 0 },
		{ display: 1, value: 1 },
		{ display: '+', value: '+' },
		{ display: '-', value: '-' },
		{ display: '*', value: '*' },
		{ display: '/', value: '/' },
		{ display: '%', value: '%' },
		{ display: '=', value: '=' },
		{ display: '≠', value: '!=' },
		{ display: '<', value: '<' },
		{ display: '≤', value: '<=' },
		{ display: '>', value: '>' },
		{ display: '≥', value: '>=' },
		{ display: (<Icon icon="question" />), value: '?' },
		{ display: 'fn()', value: '__--call--__' },
		{ display: (<Icon icon="keyboard-o" />), value: '__--keybd--__' }
	]
});

const mapDispatchToProps = (dispatch, props) => ({
	onButtonPressed(value) {
		if (value === '__--keybd--__') {
			dispatch(actions.toggleTextInput());
		} else {
			dispatch(astActions.replaceSelectedExp(createExpression(value)));
		}
	},
	onTextEntered(text) {
		const value = /^\d+$/.test(text) ? parseInt(text) : text;
		dispatch(actions.toggleTextInput());
		dispatch(astActions.replaceSelectedExp(createExpression(value)));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(AstKeyboard);
