const assert = require('assert');
const { astType, nodeType, expressionType } = require('./typeNames');

// ProgramFragment -> Node
function rootNode(frag) {
	assert.strictEqual(frag.astType, astType.PROGRAM_FRAGMENT);
	return frag.nodes[frag.rootNode];
}

// Program -> Expression
function root(program) {
	assert.strictEqual(program.astType, astType.PROGRAM);
	return program.nodes[program.expression];
}

const getAstType = x => x.astType;
const getNodeType = x => x.nodeType;
const getExpressionType = x => x.expressionType;
const getNodeOrExpType = x => {
	if (x.nodeType === nodeType.EXPRESSION) {
		return x.expressionType;
	}
	return x.nodeType;
};

const getIdentifier = (program, identId) =>
	program.identifiers[identId];
const getNode = (program, nodeId) =>
	program.nodes[nodeId];

const isLeafExpression = node => [
	expressionType.IDENTIFIER, expressionType.NUMBER
].includes(getNodeOrExpType(node));

// Program -> [Identifier]
function getRootScopeLambdaIdentifiers(program) {
	const result = [];
	for (const identId of Object.keys(program.identifiers)) {
		const identifier = getIdentifier(program, identId);
		if (identifier.scope !== null || !identifier.value) {
			continue;
		}
		const valueExp = getNode(program, identifier.value);
		if (getExpressionType(valueExp) === expressionType.LAMBDA) {
			result.push(identifier);
		}
	}
	return result;
}

// Identifier -> Boolean
function isInfixOperator(identifier) {
	return /^[^a-z0-9\s]+$/.test(identifier.displayName);
}

module.exports = {
	rootNode, root, getAstType, getNodeType,
	getExpressionType, getNodeOrExpType,
	getIdentifier, getNode, getRootScopeLambdaIdentifiers,
	isInfixOperator, isLeafExpression
};
