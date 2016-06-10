import React from 'react'
import { connect } from 'react-redux'
import AstKeyboard from './AstKeyboard'
import { actions as astActions, createExpression } from 'ast'
import { actions } from './astKeyboardReducer'
import Icon from 'lib/Icon'
import { getExpForId } from 'ast'

const mapStateToProps = state => {
	let showAddBtn = false;
	const selectedId = state.lambdaView.selectedExpId;
	if (selectedId) {
		const selectedExp = getExpForId(selectedId, state.ast);
		showAddBtn = selectedExp.tag === 'call'
		             || selectedExp.tag === 'case';
	}

	return {
		...state.astKeyboard,
		ast: state.ast,
		showAddBtn,
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
			{ display: (<Icon icon="question" />), value: '__--case--__' },
			{ display: 'fn()', value: '__--call--__' },
			{ display: (<Icon icon="keyboard-o" />), value: '__--keybd--__' }
		]
	};
};

const mapDispatchToProps = (dispatch, props) => ({
	onButtonPressed(value) {
		if (value === '__--keybd--__') {
			dispatch(actions.toggleTextInput());
		} else {
			dispatch(astActions.replaceSelectedExp(createExpression(value)));
		}
	},
	onTextEntered(text) {
		dispatch(actions.toggleTextInput());
		if (text === '') { return; }
		const value = /^\d+$/.test(text) ? parseInt(text) : text;
		dispatch(astActions.replaceSelectedExp(createExpression(value)));
	},
	onTogglePressed() {
		dispatch(actions.toggleKeyboard());
	},
	onAddPressed() {
		dispatch(astActions.appendPieceToSelectedExp());
	},
	onRemovePressed() {
		dispatch(astActions.removeSelectedExp());
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(AstKeyboard);
