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

// Program, Uid Node -> [Identifier]
function getIdentifiersScopedToNode(program, nodeId) {
	const node = getNode(program, nodeId);
	const identIds = getExpressionType(node) === expressionType.LAMBDA
		? [...node.boundIdentifiers, ...node.arguments]
		: node.boundIdentifiers
	return identIds.map(identId => getIdentifier(program, identId));
}

// Program, Uid Node -> [Identifier]
function getBoundIdentifiers(program, nodeId) {
	return getNode(program, nodeId).boundIdentifiers.map(identId =>
		getIdentifier(program, identId));
}

// Node -> [Uid Node]
function getChildrenIds(node) {
	switch (getNodeOrExpType(node)) {
		case expressionType.NUMBER: return [];
		case expressionType.IDENTIFIER: return [];
		case expressionType.LAMBDA: return [node.body]
		case expressionType.APPLICATION: return [node.lambda, ...node.arguments];
		case expressionType.CASE: return [...node.caseBranches, node.elseBranch];
		case nodeType.CASE_BRANCH: return [node.condition, node.expression];
		case nodeType.ELSE_BRANCH: return [node.expression];
		default: throw `Unexpected node: ${getNodeOrExpType(node)}.`;
	}
}

// Program, Uid Node, Maybe Boolean -> Uid Node
function getNodeToTheLeft(program, nodeId, ignoreInfix = false) {
	const node = getNode(program, nodeId);
	if (!node.parent) return node;
	const parent = getNode(program, node.parent);

	switch (getNodeOrExpType(parent)) {
		case expressionType.LAMBDA:
			if (parent.arguments.indexOf(nodeId) > 0) {
				return parent.arguments[parent.arguments.indexOf(nodeId) - 1];
			} else {
				return parent.id;
			}

		case expressionType.APPLICATION:
			if (!ignoreInfix
			 && parent.arguments.length === 2
			 && getExpressionType(getNode(program, parent.lambda)) === expressionType.IDENTIFIER
			 && isInfixOperator(getIdentifier(program, getNode(program, parent.lambda).identifier))) {
				if (parent.arguments[1] === nodeId) { return parent.lambda; }
				else if (parent.lambda === nodeId) { return parent.arguments[0]; }
				else { return parent.id; }
			} else {
				if (parent.arguments.indexOf(nodeId) > 0) {
					return parent.arguments[parent.arguments.indexOf(nodeId) - 1];
				} else if (parent.arguments.indexOf(nodeId) === 0) {
					return parent.lambda;
				} else {
					return parent.id;
				}
			}

		case expressionType.CASE:
			if (parent.caseBranches.indexOf(nodeId) > 0) {
				return parent.caseBranches[parent.caseBranches.indexOf(nodeId) - 1];
			} else if (parent.elseBranch === nodeId) {
				return parent.caseBranches[parent.caseBranches.length - 1];
			} else {
				return parent.id;
			}

		case nodeType.CASE_BRANCH:
			if (parent.expression === nodeId) { return parent.condition; }
			else { return parent.id; }

		case nodeType.ELSE_BRANCH:
		default: return parent.id;
	}
}

// Program, Uid Node, Maybe Boolean -> Uid Node
function getNodeToTheRight(program, nodeId, ignoreInfix = false) {
	// TODO move right
	return nodeId;
}

// Program, Uid Node -> Uid Node
function getNodeInside(program, nodeId) {
	// TODO move inside
	return nodeId;
}

// Program, Uid Node -> Uid Node
function getNodeOutside(program, nodeId) {
	// TODO move outside
	return nodeId;
}

module.exports = {
	rootNode, root, getAstType, getNodeType,
	getExpressionType, getNodeOrExpType,
	getIdentifier, getNode, getRootScopeLambdaIdentifiers,
	isInfixOperator, isLeafExpression,
	getIdentifiersScopedToNode, getBoundIdentifiers,
	getChildrenIds,
	getNodeToTheLeft, getNodeToTheRight,
	getNodeInside, getNodeOutside
};
