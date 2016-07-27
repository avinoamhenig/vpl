import React from 'react'
import Icon from 'lib/Icon'
import {
	getVisibleIdentifiers,
	getEntityType, getEntity,
	expressionType
} from 'ast'
import { actions as astActions } from 'program'

export default (program, selectedExpId, dispatch) => ({
	display: <Icon icon="sitemap" />,
	buttons: Object.keys(program.typeDefinitions)
		.map(id => program.typeDefinitions[id])
		.filter(typeDef => typeDef.constructors.length > 0)
		.map(typeDef => ({
			display: typeDef.displayName,
			handler() {
				dispatch(astActions.replaceSelectedExp(
					expressionType.DECONSTRUCTION,
					typeDef.id
				));
			}
		}))
});
