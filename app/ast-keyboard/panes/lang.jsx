import React from 'react'
import Icon from 'lib/Icon'
import { insertText, makeDefaultCaseExp, makeDefaultAppExp } from './helpers'
import { actions as astActions } from 'program'
import { actions } from '../astKeyboardReducer'

export default (program, selectedExpId, dispatch) => ({
	display: (<Icon icon="asterisk" />),
	buttons: [
		{ display: (<Icon icon="question" />)
		, handler: () => dispatch(
				astActions.replaceSelectedExp(makeDefaultCaseExp())) },
		{ display: 'do'
		, handler: () => dispatch(astActions.wrapSelectedExpInDo()) }
	]
});
