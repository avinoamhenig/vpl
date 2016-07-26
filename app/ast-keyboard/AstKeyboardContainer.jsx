import React from 'react'
import { connect } from 'react-redux'
import AstKeyboard from './AstKeyboard'
import { actions } from './astKeyboardReducer'
import { actions as astActions } from 'program'
import Icon from 'lib/Icon'
import * as panes from './panes'
import { insertText } from './panes/helpers'

const mapStateToProps = state => state;
const mapDispatchToProps = dispatch => ({ dispatch });

const mergeProps = (state, {dispatch}, ownProps) => {
	const program = state.program;
	const selectedExpId = state.lambdaView.selectedExpId;

	return {
		...ownProps,
		...state.astKeyboard,
		onTextEntered(text) {
			if (state.astKeyboard.naming) {
				dispatch(actions.toggleNameKeyboard());
				if (text !== '') {
					dispatch(astActions.nameSelectedNode(text));
				}
			} else {
				dispatch(actions.toggleTextInput());
				if (text !== '') {
					insertText(text, dispatch, program);
				}
			}
		},
		onTogglePressed: () => dispatch(actions.toggleKeyboard()),
		onPaneSelected: pane => dispatch(actions.selectPane(pane)),
		selectedPane: state.astKeyboard.selectedPane,
		toolbarButtons: state.lambdaView.selectedExpId ? [
			{ display: (<Icon icon="keyboard-o" />)
			, handler: () => dispatch(actions.toggleTextInput()) },
			{ display: (<Icon icon="trash" />)
			, handler: () => dispatch(astActions.removeSelectedExp()) },
			{ display: ':='
			, handler: () => {
					dispatch(astActions.addIdentifierToSelectedExp('x'));
					dispatch(actions.toggleNameKeyboard());
				} },
			{ display: (<Icon icon="tag" />)
			, handler: () => dispatch(actions.toggleNameKeyboard()) },
			{ display: (<Icon icon="plus" />)
			, handler: () => dispatch(astActions.appendPieceToSelectedExp()) },
		] : [],
		panes: [
			panes.lang(program, selectedExpId, dispatch),
			panes.numeric(program, selectedExpId, dispatch),
			panes.identifiers(program, selectedExpId, dispatch),
			panes.lambdas(program, selectedExpId, dispatch),
			panes.constructors(program, selectedExpId, dispatch)
		]
	};
};

export default connect(
	mapStateToProps, mapDispatchToProps, mergeProps
)(AstKeyboard);
