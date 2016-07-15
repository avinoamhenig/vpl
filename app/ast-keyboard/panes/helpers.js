import {
	getNode, getNodeOrExpType, expressionType,
	createNumberExpression, createIdentifier, createIdentifierExpression,
	createApplicationExpression, createCaseExpression, createCaseBranch,
	createElseBranch
} from 'ast'
import { actions as astActions } from 'program'
import { actions } from '../astKeyboardReducer'

const textToAction = (value, program) => {
	value = /^\-?\d+$/.test(value) ? parseInt(value) : value;
	if (typeof value === 'number') {
		return astActions.replaceSelectedExp(createNumberExpression(value));
	} else {
		let identId = Object.keys(program.identifiers).filter(id =>
			program.identifiers[id].displayName === value)[0];
		let identExp;
		if (!identId) {
			identExp = createIdentifierExpression(createIdentifier(value));
		} else {
			identExp = createIdentifierExpression(program.identifiers[identId]);
		}
		return astActions.replaceSelectedExp(identExp);
	}
};
export const makeDefaultCaseExp = () => createCaseExpression(
	[createCaseBranch(createNumberExpression(0), createNumberExpression(0))],
	createNumberExpression(0)
);
export const makeDefaultAppExp = () => createApplicationExpression(
	createNumberExpression(0), []
);

export const insertText = (text, dispatch, program) =>
	dispatch(textToAction(text, program));
