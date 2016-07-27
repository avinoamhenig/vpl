import React from 'react'
import Icon from 'lib/Icon'
import { getVisibleIdentifiers, expressionType, matchTypes } from 'ast'
import { actions as astActions } from 'program'

export default (program, selectedExpId, dispatch) => ({
	display: (<Icon icon="info" />),
	buttons: getVisibleIdentifiers(program, selectedExpId)
	.filter(ident =>
		!selectedExpId ||
		!!matchTypes(
			program,
			program.types[ident.id],
			program.types[selectedExpId]
		)
	)
	.map(ident => ({
		display: ident.displayName,
		handler() {
			dispatch(astActions.replaceSelectedExp(
				expressionType.IDENTIFIER,
				ident.id
			));
		}
	}))
});
