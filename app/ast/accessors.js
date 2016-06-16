import assert from 'assert';
import { astType, nodeType, expressionType } from './typeNames';

// ProgramFragment -> Node
export function rootNode(frag) {
	assert.strictEqual(frag.astType, astType.PROGRAM_FRAGMENT);
	return frag.nodes[frag.rootNode];
}

// Program -> Expression
export function root(program) {
	assert.strictEqual(program.astType, astType.PROGRAM);
	return program.nodes[program.expression];
}

export const getAstType = x => x.astType;
export const getNodeType = x => x.nodeType;
export const getExpressionType = x => x.expressionType;
export const getNodeOrExpType = x => {
	if (x.nodeType === nodeType.EXPRESSION) {
		return x.expressionType;
	}
	return x.nodeType;
};

export const getIdentifier = (program, identId) =>
	program.identifiers[identId];
export const getNode = (program, nodeId) =>
	program.nodes[nodeId];
