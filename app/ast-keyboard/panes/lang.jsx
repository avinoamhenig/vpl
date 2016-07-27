import React from 'react'
import Icon from 'lib/Icon'
import { actions as astActions } from 'program'
import { expressionType } from 'ast'

export default (program, selectedExpId, dispatch) => ({
	display: (<Icon icon="asterisk" />),
	buttons: [
		{ display: (<Icon icon="question" />)
		, handler: () => dispatch(
				astActions.replaceSelectedExp(expressionType.CASE) )
		},
		{ display: 'do'
		, handler: () => dispatch(
				astActions.replaceSelectedExp(expressionType.DO) )
		}
	]
});
