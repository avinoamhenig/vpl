import React from 'react'
import Icon from 'lib/Icon'
import {
	getVisibleIdentifiers,
	getEntityType, getEntity,
	expressionType
} from 'ast'
import { actions as astActions } from 'program'

export default (program, selectedExpId, dispatch) => ({
	display: 'fn',
	buttons: getVisibleIdentifiers(program, selectedExpId)
		.filter(ident =>
			 ident.value
		&& (getEntityType(getEntity(program, ident.value)) === expressionType.LAMBDA
		|| getEntityType(getEntity(program, ident.value)) === expressionType.BUILT_IN_FUNCTION)
		)
		.map(ident => ({
			display: ident.displayName,
			handler() {
				dispatch(astActions.replaceSelectedExp(
					expressionType.APPLICATION,
					ident.id
				));
			}
		}))
});
