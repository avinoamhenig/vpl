import React from 'react'
import Icon from 'lib/Icon'
import {
	getVisibleIdentifiers,
	createIdentifierExpression
} from 'ast'
import { actions as astActions } from 'program'

export default (program, selectedExpId, dispatch) => ({
	display: (<Icon icon="info" />),
	buttons: getVisibleIdentifiers(program, selectedExpId).map(ident => ({
		display: ident.displayName,
		handler() {
			dispatch(astActions.replaceSelectedExp(
				createIdentifierExpression(ident)
			));
		}
	}))
});
