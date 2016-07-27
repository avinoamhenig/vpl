import React from 'react'
import Icon from 'lib/Icon'
import {
	getVisibleIdentifiers,
	getEntityType,
	getEntity,
	expressionType,
	matchTypes,
	createTypeDefType
} from 'ast'
import { actions as astActions } from 'program'

export default (program, selectedExpId, dispatch) => ({
	display: 'cns',
	buttons: Object.keys(program.constructors)
		.map(consId => program.constructors[consId])
		.filter(cons =>
			!selectedExpId ||
			!!matchTypes(
				program,
				createTypeDefType(program, cons.typeDefinition).newType,
				program.types[selectedExpId]
			)
		)
		.map(constructor => ({
			display: constructor.displayName,
			handler() {
				dispatch(astActions.replaceSelectedExp(
					expressionType.CONSTRUCTION,
					constructor.id
				));
			}
		}))
});
