import React from 'react'
import { connect } from 'react-redux'
import AstKeyboard from './AstKeyboard'
import { actions } from './astKeyboardReducer'
import Icon from 'lib/Icon'
import { actions as astActions } from 'program'
import {
	getNode, getNodeOrExpType, expressionType,
	createNumberExpression, createIdentifier, createIdentifierExpression,
	createApplicationExpression, createCaseExpression, createCaseBranch,
	createElseBranch
} from 'ast'

const mapStateToProps = state => {
	let showAddBtn = false;
	const selectedId = state.lambdaView.selectedExpId;
	if (selectedId) {
		const selectedExp = getNode(state.program, selectedId);
		if (selectedExp) {
			showAddBtn = getNodeOrExpType(selectedExp) === expressionType.APPLICATION
			          || getNodeOrExpType(selectedExp) === expressionType.CASE;
		}
	}

	return {
		...state.astKeyboard,
		isNodeSelected: !!selectedId,
		showAddBtn,
		program: state.program
	};
};

const mapDispatchToProps = (dispatch, props) => ({
	dispatch,
	onButtonPressed(value) {
		if (value === '__--keybd--__') {
			dispatch(actions.toggleTextInput());
		} else {
			value();
		}
	},
	onTogglePressed: () => dispatch(actions.toggleKeyboard()),
	onAddPressed: () => dispatch(astActions.appendPieceToSelectedExp()),
	onRemovePressed: () => dispatch(astActions.removeSelectedExp()),
	onBindPressed: () => {
		dispatch(astActions.addIdentifierToSelectedExp('x'));
		dispatch(actions.toggleNameKeyboard())
	},
	onNamePressed: () => dispatch(actions.toggleNameKeyboard())
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
	const dispatch = dispatchProps.dispatch;
	const program = stateProps.program;

	const valueToExp = value => {
		value = /^\d+$/.test(value) ? parseInt(value) : value;
		if (typeof value === 'number') {
			dispatch(astActions.replaceSelectedExp(createNumberExpression(value)));
		} else {
			let identId = Object.keys(program.identifiers).filter(id =>
				program.identifiers[id].displayName === value)[0];
			let identExp;
			if (!identId) {
				identExp = createIdentifierExpression(createIdentifier(value));
			} else {
				identExp = createIdentifierExpression(program.identifiers[identId]);
			}
			dispatch(astActions.replaceSelectedExp(identExp));
		}
	};

	const caseExp = () => dispatch(astActions.replaceSelectedExp(
		createCaseExpression(
			[createCaseBranch(createNumberExpression(0), createNumberExpression(0))],
			createNumberExpression(0)
		)
	));

	const appExp = () => dispatch(astActions.replaceSelectedExp(
		createApplicationExpression(
			createNumberExpression(0), []
		)
	));

	return {
		...ownProps,
		...stateProps,
		...dispatchProps,
		state: undefined, dispatch: undefined,
		onTextEntered(text) {
			if (stateProps.naming) {
				dispatch(actions.toggleNameKeyboard());
				if (text === '') { return; }
				dispatch(astActions.nameSelectedNode(text));
			} else {
				dispatch(actions.toggleTextInput());
				if (text === '') { return; }
				valueToExp(text);
			}
		},
		buttons: [
			{ display: 0, value: () => valueToExp(0) },
			{ display: 1, value: () => valueToExp(1) },
			{ display: '+', value: () => valueToExp('+') },
			{ display: '-', value: () => valueToExp('-') },
			{ display: '*', value: () => valueToExp('*') },
			{ display: '/', value: () => valueToExp('/') },
			{ display: '%', value: () => valueToExp('%') },
			{ display: '=', value: () => valueToExp('=') },
			{ display: '≠', value: () => valueToExp('!=') },
			{ display: '<', value: () => valueToExp('<') },
			{ display: '≤', value: () => valueToExp('<=') },
			{ display: '>', value: () => valueToExp('>') },
			{ display: '≥', value: () => valueToExp('>=') },
			{ display: (<Icon icon="question" />), value: caseExp },
			{ display: 'fn()', value: appExp },
			{ display: (<Icon icon="keyboard-o" />), value: '__--keybd--__' }
		]
	};
};

export default connect(
	mapStateToProps, mapDispatchToProps, mergeProps
)(AstKeyboard);
