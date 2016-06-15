// TODO in progress, will be used to test that v2 is working properly

import assert from 'assert';
import {
	root,
	getAstType, getNodeOrExpType,
	astType, nodeType, expressionType,
	getIdentifier
} from '../../app/ast';

export default program => {
	assert.strictEqual(getAstType(program), astType.PROGRAM);

	return convertNode(root(program), program);
}

const convertNode = (node, program) => {
	switch (getNodeOrExpType(node)) {
		case expressionType.NUMBER: return {
			tag: 'number',
			val: node.value
		};

		case expressionType.IDENTIFIER: return {
			tag: 'identifier',
			identifier: getIdentifier(program, node.identifier).displayName
		};

		case expressionType.LAMBDA: return {

		};

		case expressionType.APPLICATION:

		case expressionType.CASE:

		case nodeType.CASE_BRANCH:

		case nodeType.ELSE_BRANCH:

		default:
			throw `Unexpected node: ${getNodeOrExpType(node)}.`;
	}
};
