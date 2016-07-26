import React from 'react'
import Icon from 'lib/Icon'
import { actions as astActions } from 'program'
import { expressionType } from 'ast'

export default (program, selectedExpId, dispatch) => ({
		display: (<Icon icon="hashtag" />),
		buttons: [
			{ display: '0'
			, handler: () =>  dispatch(
					astActions.replaceSelectedExp(expressionType.NUMBER, 0)) },
			{ display: '1'
			, handler: () =>  dispatch(
					astActions.replaceSelectedExp(expressionType.NUMBER, 1)) },
			{ display: '2'
			, handler: () =>  dispatch(
					astActions.replaceSelectedExp(expressionType.NUMBER, 2)) },
			{ display: '3'
			, handler: () =>  dispatch(
					astActions.replaceSelectedExp(expressionType.NUMBER, 3)) },
			{ display: '4'
			, handler: () =>  dispatch(
					astActions.replaceSelectedExp(expressionType.NUMBER, 4)) },
			{ display: '5'
			, handler: () =>  dispatch(
					astActions.replaceSelectedExp(expressionType.NUMBER, 5)) },
			{ display: '6'
			, handler: () =>  dispatch(
					astActions.replaceSelectedExp(expressionType.NUMBER, 6)) },
			{ display: '7'
			, handler: () =>  dispatch(
					astActions.replaceSelectedExp(expressionType.NUMBER, 7)) },
			{ display: '8'
			, handler: () =>  dispatch(
					astActions.replaceSelectedExp(expressionType.NUMBER, 8)) },
			{ display: '9'
			, handler: () =>  dispatch(
					astActions.replaceSelectedExp(expressionType.NUMBER, 9)) }
	]
});
